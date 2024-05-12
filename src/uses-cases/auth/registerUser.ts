import Joi from '@hapi/joi';
import UserSchema from '../../entities/schemas/User.schema';
import {IUsersDb} from '../../types/dataaccess';
import userValidator from '../../utils/validators/user.validator';
import ResponseMessage, {
  UnhandledErrorMessage,
  ValidationMessage,
} from '../../utils/responseHandler/responseMessage';

export default async function registerUser(
  db: IUsersDb,
  data:
    | {[key: string]: unknown}
    | {[key: string]: unknown}[]
    | UserSchema
    | UserSchema[]
): Promise<UserSchema | UserSchema[]> {
  try {
    const {createUsers} = db;
    // Validate data with joi schema
    const validator = Array.isArray(data)
      ? Joi.array().items(userValidator)
      : userValidator;

    await validator.validateAsync(data, {abortEarly: false});

    const emails = Array.isArray(data)
      ? data?.map(item => (item?.email as string)?.trim()?.toLowerCase())
      : [(data.email as string).trim().toLowerCase()];

    // Check if user with email already exists
    const foundUser = await db.findOneUser({
      email: {
        $in: emails,
      },
    });

    if (foundUser) {
      throw new ValidationMessage(new Error('User(s) already exist'));
    }

    const createdUsers = await createUsers(data);
    // Emit rabbitMQ event if necessary
    return createdUsers;
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
