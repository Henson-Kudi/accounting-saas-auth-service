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
import IDataAccess from '../types/dataaccess';

export default class UsersDb implements IDataAccess {
  async findUsers(
    filter: FilterQuery<UserSchema>,
    projection?: ProjectionType<UserSchema>,
    options?: QueryOptions<UserSchema>
  ): Promise<UserSchema[]> {
    try {
      const result = await UserModel.find(
        filter,
        projection,
        options ?? {
          sort: {createdAt: -1},
        }
      ).lean();

      return result;
    } catch (error) {
      throw error;
    }
  }

  async createUsers(
    data:
      | {[key: string]: any}
      | {[key: string]: any}[]
      | UserSchema
      | UserSchema[]
  ): Promise<any> {
    try {
      const created = await UserModel.create(data);

      return Array.isArray(created)
        ? created?.map(item => item?.toObject())
        : created.toObject();
    } catch (error) {
      throw error;
    }
  }

  async findOneUser(
    filter: FilterQuery<UserSchema>,
    projection?: ProjectionType<UserSchema>,
    options?: QueryOptions<UserSchema>
  ): Promise<UserSchema | null> {
    try {
      const found = await UserModel.findOne(filter, projection, options);

      return found?.toObject() ?? null;
    } catch (error) {
      throw error;
    }
  }

  async findUserById(
    id: mongoose.Types.ObjectId,
    projection?: ProjectionType<UserSchema>,
    options?: QueryOptions<UserSchema>
  ): Promise<UserSchema | null> {
    try {
      const found = await UserModel.findById(id, projection, options);

      return found?.toObject() ?? null;
    } catch (error) {
      throw error;
    }
  }

  async findUserByEmail(
    email: string,
    projection?: ProjectionType<UserSchema>,
    options?: QueryOptions<UserSchema>
  ): Promise<UserSchema | null> {
    try {
      const found = await UserModel.findOne(
        {
          email: email?.trim().toLowerCase(),
        },
        projection,
        options
      );

      return found?.toObject() ?? null;
    } catch (error) {
      throw error;
    }
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
    try {
      const updated = await UserModel.findOneAndUpdate(filter, update, {
        ...(options ?? {}),
        new: options?.new === false ? false : true,
      });

      return updated?.toObject() ?? null;
    } catch (error) {
      throw error;
    }
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
    try {
      const updated = await UserModel.findByIdAndUpdate(id, update, {
        ...(options ?? {}),
        new: options?.new === false ? false : true,
      });

      return updated?.toObject() ?? null;
    } catch (error) {
      throw error;
    }
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
    newData: boolean = false,
    options?: mongo.UpdateOptions
  ): Promise<UserSchema[] | UpdateWriteOpResult> {
    try {
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
    } catch (error) {
      throw error;
    }
  }
}
