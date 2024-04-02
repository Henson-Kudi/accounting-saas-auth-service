import mongoose, {mongo, UpdateQuery} from 'mongoose';

export default interface IDataAccess {
  findUsers(
    filter: FilterQuery<UserSchema>,
    projection?: ProjectionType<UserSchema>,
    options?: QueryOptions<UserSchema>
  ): Promise<UserSchema[]>;

  createUsers(
    data:
      | {[key: string]: any}
      | {[key: string]: any}[]
      | UserSchema
      | UserSchema[]
  ): Promise<FlattenMaps<UserSchema> | FlattenMaps<UserSchema>[]>;

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
