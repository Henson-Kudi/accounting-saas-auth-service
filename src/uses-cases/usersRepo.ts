import { QueryOptions, Types, UpdateQuery } from 'mongoose';
import UserSchema from '../entities/schemas/User.schema';
import { IUsersRepository } from '../types/RepositoryLocator';
import registerUser from './auth/registerUser';
import { IUsersDb } from '../types/dataaccess';
import IServices from '../types/services';
import refreshToken from './auth/refreshToken';
import verifyOtpCode from './auth/verifyOtpCode';
import attemptLogin from './auth/attemptLogin';
import UserTokensSchema from '../entities/schemas/UserTokens.schema';
import { AUTHENTICATION_EXCHANGE } from '../utils/constants/rabbitMqQueues.json';

export default class UsersRepository implements IUsersRepository {
  constructor(
    private db: IUsersDb,
    private services: IServices
  ) { }

  async verifyOtpCode(data: { [key: string]: unknown }): Promise<{
    accessToken: string;
    refreshToken: string;
    user: UserSchema;
  } | null> {
    console.log(data, 'otp data')
    return await verifyOtpCode(data, this.db, this.services);
  }

  async refreshToken(
    payload: { [key: string]: unknown } & { token: string }
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: UserSchema;
  } | null> {
    return await refreshToken(payload, this.db, this.services);
  }

  async attemptLogin(data: { [key: string]: unknown }): Promise<{
    accessToken: string;
    refreshToken: string;
    user: UserSchema;
  } | null> {
    return await attemptLogin(data, this.db, this.services);
  }

  async registerUser(data: {
    [key: string]: unknown;
  }): Promise<UserSchema | UserSchema[]> {
    const registeredUser = await registerUser(this.db, data, this.services);

    return registeredUser;
  }

  async findUserById(
    id: Types.ObjectId,
    projection?: { [key: string]: unknown },
    options?: { [key: string]: unknown }
  ): Promise<UserSchema | null> {
    const user = await this.db.findUserById(id, projection, options);

    if (!user) {
      return null;
    }

    if (user.isDeleted) {
      return null;
    }

    if (!user.isActive) {
      return null;
    }

    return user;
  }

  async findUserByIdAndUpdate(
    id: Types.ObjectId,
    update: UpdateQuery<UserSchema | { [key: string]: unknown }>,
    options?: QueryOptions<UserSchema>
  ): Promise<UserSchema | null> {
    // if update has deleted turned to true, then make active false
    if (update.isDeleted) {
      update.isActive = false;
    }
    // We do not want to update details of inactive and deleted users.
    const user = await this.db.updateOneUser(
      {
        _id: id,
        isActive: true,
        isDeleted: false,
      },
      update,
      options
    );

    if (!user) {
      return null;
    }

    // If updated fields include isDeleted, then we want to publish a deleted account message
    if (update.isDeleted) {
      // Publish message to rabbitMq of user updated
      await this.services.rabbitMqService.publishMessage({
        exchange: AUTHENTICATION_EXCHANGE.name,
        routeKey: AUTHENTICATION_EXCHANGE.routeKeys.accountDeleted,
        exchangeType: 'topic',
        task: Buffer.from(
          JSON.stringify({
            id: user.id,
            update,
          })
        ),
      });
    } else {
      // Publish message to rabbitMq of user updated
      await this.services.rabbitMqService.publishMessage({
        exchange: AUTHENTICATION_EXCHANGE.name,
        routeKey: AUTHENTICATION_EXCHANGE.routeKeys.accountUpdated,
        exchangeType: 'topic',
        task: Buffer.from(
          JSON.stringify({
            id: user.id,
            update,
          })
        ),
      });
    }

    //
    return user;
  }

  async createToken(
    data:
      | { [key: string]: unknown }
      | { [key: string]: unknown }[]
      | UserTokensSchema
      | UserTokensSchema[]
  ): Promise<UserTokensSchema | UserTokensSchema[]> {
    // Validate data authenticity
    const created = await this.db.createToken(data);
    return created;
  }
}
