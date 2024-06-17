import mongoose, {
  FilterQuery,
  mongo,
  QueryOptions,
  UpdateQuery,
} from 'mongoose';
import UserTokensSchema from '../entities/schemas/UserTokens.schema';
import UserSchema from '../entities/schemas/User.schema';

export interface IUsersDb extends IUserTokensDb {
  findUsers(
    filter: FilterQuery<UserSchema>,
    projection?: ProjectionType<UserSchema>,
    options?: QueryOptions<UserSchema>
  ): Promise<UserSchema[]>;

  createUsers(
    data: { [key: string]: unknown } | UserSchema
  ): Promise<FlattenMaps<UserSchema>>;

  findOneUser(
    filter: FilterQuery<UserSchema>,
    projection?: ProjectionType<UserSchema>,
    options?: QueryOptions<UserSchema>
  ): Promise<UserSchema | null>;

  findUserById(
    id: mongoose.Types.ObjectId,
    projection?: ProjectionType<UserSchema>,
    options?: QueryOptions<UserSchema>
  ): Promise<UserSchema | null>;

  findUserByEmail(
    email: string,
    projection?: ProjectionType<UserSchema>,
    options?: QueryOptions<UserSchema>
  ): Promise<UserSchema | null>;

  updateOneUser(
    filter: FilterQuery<UserSchema>,
    update?: UpdateQuery<
      Pick<
        UserSchema,
        | 'addresses'
        | 'contacts'
        | 'email'
        | 'isActive'
        | 'isDeleted'
        | 'name'
        | 'updatedAt'
      >
    >,
    options?: QueryOptions<UserSchema>
  ): Promise<UserSchema | null>;

  findUserByIdAndUpdate(
    id: mongoose.Types.ObjectId,
    update?: UpdateQuery<UserSchema>,
    options?: QueryOptions<UserSchema>
  ): Promise<UserSchema | null>;

  updateManyUsers(
    filter: FilterQuery<UserSchema>,
    update: UpdateQuery<
      Pick<
        UserSchema,
        | 'addresses'
        | 'contacts'
        | 'email'
        | 'isActive'
        | 'isDeleted'
        | 'name'
        | 'updatedAt'
      >
    >,
    newData: boolean = false,
    options?: mongo.UpdateOptions
  ): Promise<UserSchema[] | UpdateWriteOpResult>;
}

export interface IUserTokensDb {
  createToken(
    data:
      | { [key: string]: unknown }
      | { [key: string]: unknown }[]
      | UserTokensSchema
      | UserTokensSchema[]
  ): Promise<UserTokensSchema | UserTokensSchema[]>;
  findTokens(
    filter: FilterQuery<UserTokensSchema>,
    projection?: ProjectionType<UserTokensSchema>,
    options?: QueryOptions<UserTokensSchema>
  ): Promise<UserTokensSchema[]>;
  findToken(
    filter: FilterQuery<UserTokensSchema>,
    projection?: ProjectionType<UserTokensSchema>,
    options?: QueryOptions<UserTokensSchema>
  ): Promise<UserTokensSchema | null>;
  deleteTokens(filter: FilterQuery<UserTokensSchema>): Promise<boolean>;
}


