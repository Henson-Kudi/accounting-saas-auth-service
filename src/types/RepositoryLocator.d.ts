import mongoose from 'mongoose';
import UserSchema from '../entities/schemas/User.schema';
import UserTokensSchema from '../entities/schemas/UserTokens.schema';

export interface IUsersRepository {
  registerUser(
    user:
      | {[key: string]: unknown}
      | {[key: string]: unknown}[]
      | UserSchema
      | UserSchema[]
  ): Promise<UserSchema | UserSchema[]>;

  verifyOtpCode(data: {[key: string]: unknown}): Promise<{
    accessToken: string;
    refreshToken: string;
    user: UserSchema;
  } | null>;

  attemptLogin(data: unknown): Promise<{
    accessToken: string;
    refreshToken: string;
    user: UserSchema;
  } | null>;

  refreshToken(payload: {[key: string]: unknown} & {token: string}): Promise<{
    accessToken: string;
    refreshToken: string;
    user: UserSchema;
  } | null>;

  findUserById(
    id: mongoose.Types.ObjectId,
    projection?: ProjectionType<UserSchema>,
    options?: QueryOptions<UserSchema>
  ): Promise<UserSchema | null>;

  findUserByIdAndUpdate(
    id: mongoose.Types.ObjectId,
    update: UpdateQuery<UserSchema>,
    options?: QueryOptions<UserSchema>
  ): Promise<UserSchema | null>;

  createToken(
    data:
      | {[key: string]: unknown}
      | {[key: string]: unknown}[]
      | UserTokensSchema
      | UserTokensSchema[]
  ): Promise<UserTokensSchema | UserTokensSchema[]>;
}

export default interface RepositoryLocator {
  usersRepository: IUsersRepository;
}
