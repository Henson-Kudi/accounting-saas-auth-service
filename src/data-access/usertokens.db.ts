import {FilterQuery} from 'mongoose';
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
  findTokens(
    filter: FilterQuery<UserTokensSchema>,
    projection?: any,
    options?: any
  ): Promise<UserTokensSchema[]> {
    throw new Error('Method not implemented.');
  }
  async findToken(
    filter: FilterQuery<UserTokensSchema>,
    projection?: any,
    options?: any
  ): Promise<UserTokensSchema | null> {
    const found = await UserTokenModel.findOne(filter, projection, options);

    return found;
  }
  deleteTokens(filter: FilterQuery<UserTokensSchema>): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
