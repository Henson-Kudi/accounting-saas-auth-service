import {FilterQuery, ProjectionType, QueryOptions} from 'mongoose';
import UserTokensSchema from '../entities/schemas/UserTokens.schema';
import {IUserTokensDb} from '../types/dataaccess';
import {UserTokenModel} from '../entities/models';

export default class UserTokensDb implements IUserTokensDb {
  async createToken(
    data:
      | {[key: string]: unknown}
      | {[key: string]: unknown}[]
      | UserTokensSchema
      | UserTokensSchema[]
  ): Promise<UserTokensSchema | UserTokensSchema[]> {
    const created = await UserTokenModel.create(data);
    const json = Array.isArray(created)
      ? created?.map(item => item?.toObject())
      : created?.toObject();
    return json;
  }

  async findTokens(
    filter: FilterQuery<UserTokensSchema>,
    projection?: ProjectionType<UserTokensSchema>,
    options?: QueryOptions<UserTokensSchema>
  ): Promise<UserTokensSchema[]> {
    const found = await UserTokenModel.find(filter, projection, options);

    return found;
  }

  async findToken(
    filter: FilterQuery<UserTokensSchema>,
    projection?: ProjectionType<UserTokensSchema>,
    options?: QueryOptions<UserTokensSchema>
  ): Promise<UserTokensSchema | null> {
    const found = await UserTokenModel.findOne(filter, projection, options);

    return found;
  }

  async deleteTokens(filter: FilterQuery<UserTokensSchema>): Promise<boolean> {
    await UserTokenModel.deleteMany(filter);
    return true;
  }
}
