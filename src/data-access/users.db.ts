import mongoose, {
  FilterQuery,
  mongo,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
  UpdateWriteOpResult,
} from 'mongoose';
import UserSchema from '../entities/schemas/User.schema';
import {UserModel} from '../entities/models';
import {IUsersDb} from '../types/dataaccess';
import UserTokensDb from './usertokens.db';

export default class UsersDb extends UserTokensDb implements IUsersDb {
  async findUsers(
    filter: FilterQuery<UserSchema>,
    projection?: ProjectionType<UserSchema>,
    options?: QueryOptions<UserSchema>
  ): Promise<UserSchema[]> {
    const result = await UserModel.find(
      {
        isActive: true,
        isDeleted: false,
        ...filter,
      },
      projection,
      options ?? {
        sort: {createdAt: -1},
      }
    ).lean();

    return result;
  }

  async createUsers(
    data:
      | {[key: string]: unknown}
      | {[key: string]: unknown}[]
      | UserSchema
      | UserSchema[]
  ): Promise<UserSchema | UserSchema[] | null> {
    const created = await UserModel.create(data);

    return Array.isArray(created)
      ? created?.map(item => item?.toObject())
      : created.toObject();
  }

  async findOneUser(
    filter: FilterQuery<UserSchema>,
    projection?: ProjectionType<UserSchema>,
    options?: QueryOptions<UserSchema>
  ): Promise<UserSchema | null> {
    const found = await UserModel.findOne(
      {isActive: true, isDeleted: false, ...filter},
      projection,
      options
    );

    return found?.toObject() ?? null;
  }

  async findUserById(
    id: mongoose.Types.ObjectId,
    projection?: ProjectionType<UserSchema>,
    options?: QueryOptions<UserSchema>
  ): Promise<UserSchema | null> {
    const found = await UserModel.findById(id, projection, options);

    return found?.toObject() ?? null;
  }

  async findUserByEmail(
    email: string,
    projection?: ProjectionType<UserSchema>,
    options?: QueryOptions<UserSchema>
  ): Promise<UserSchema | null> {
    const found = await UserModel.findOne(
      {
        email: email?.trim().toLowerCase(),
      },
      projection,
      options
    );

    return found?.toObject() ?? null;
  }

  async updateOneUser(
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
  ): Promise<UserSchema | null> {
    const updated = await UserModel.findOneAndUpdate(filter, update, {
      ...(options ?? {}),
      new: options?.new === false ? false : true,
    });

    return updated?.toObject() ?? null;
  }

  async findUserByIdAndUpdate(
    id: mongoose.Types.ObjectId,
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
  ): Promise<UserSchema | null> {
    const updated = await UserModel.findByIdAndUpdate(id, update, {
      ...(options ?? {}),
      new: options?.new === false ? false : true,
    });

    return updated?.toObject() ?? null;
  }

  async updateManyUsers(
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
    newData = false,
    options?: mongo.UpdateOptions
  ): Promise<UserSchema[] | UpdateWriteOpResult> {
    let found;
    if (newData) {
      found = await UserModel.find(filter).lean();
    }

    const updated = await UserModel.updateMany(filter, update, {
      ...(options ?? {}),
    });

    if (newData) {
      const updateData = await UserModel.find({
        _id: {$in: found?.map(item => item?._id)},
      }).lean();
      return updateData;
    }

    return updated;
  }
}
