import Joi from '@hapi/joi';
import UserSchema from '../../entities/schemas/User.schema';
import {IUsersDb} from '../../types/dataaccess';
import userValidator from '../../utils/validators/user.validator';
import ResponseMessage, {
  UnhandledErrorMessage,
  ValidationMessage,
} from '../../utils/responseHandler/responseMessage';
import IServices from '../../types/services';
import { AUTHENTICATION_EXCHANGE } from '../../utils/constants/rabbitMqQueues.json';

export default async function registerUser(
  db: IUsersDb,
  data: {[key: string]: unknown},
  services: IServices
): Promise<UserSchema> {
  try {
    const {createUsers} = db;
    // Validate data with joi schema

    await userValidator.validateAsync(data, {abortEarly: false});

    // Check if user with email already exists
    const foundUser = await db.findOneUser({
      email: (data?.email as string)?.toLowerCase(),
    });

    if (foundUser) {
      throw new ValidationMessage(
        new Error(`User with email: ${data.email} already exist`)
      );
    }
    // Hash password before creating user
    data.passwordHash = await services.passwordService.encrypt(
      data.password as string
    );

    const createdUser = await createUsers(data);

    // publish user created message to rabbitMq
    await services.rabbitMqService.publishMessage({
      exchange: AUTHENTICATION_EXCHANGE.name,
      routeKey: AUTHENTICATION_EXCHANGE.routeKeys.accountCreated,
      exchangeType: 'topic',
      task: Buffer.from(JSON.stringify(createdUser)),
    });

    return createdUser;
  } catch (err: any) {
    // Case of Joi error
    if (Joi.isError(err)) {
      throw new ValidationMessage(err);
    }
    // Case of mongodb error
    if (err?.errors) {
      const details = Object.values(err?.errors)?.map(
        (item: any) => item?.message
      );

      const message = 'Validations failed';

      throw new ValidationMessage(
        new Joi.ValidationError(message, details, null)
      );
    }

    if (err instanceof ResponseMessage) {
      throw err;
    }

    throw new UnhandledErrorMessage(err, err?.message);
  }
}
