import {prop, index} from '@typegoose/typegoose';
import BaseDocument from './baseDoc';
import mongoose from 'mongoose';

@index({expireAt: 1}, {expireAfterSeconds: 0})
@index({userId: 1, token: 1, type: 1}, {unique: true})
export default class UserTokensSchema extends BaseDocument {
  constructor(
    data: Pick<UserTokensSchema, 'type' | 'expireAt' | 'token' | 'userId'> &
      Omit<UserTokensSchema, '_id' | 'id' | 'updatedAt'>
  ) {
    super();

    Object.assign(this, data);

    data.createdAt && (this.createdAt = data?.createdAt);
  }

  @prop({
    required: true,
    trim: true,
    index: true,
    maxlength: 52,
    minlength: 3,
    enum: ['OTP', 'ACCESS_TOKEN', 'REFRESH_TOKEN'],
  })
  public type!: 'OTP' | 'ACCESS_TOKEN' | 'REFRESH_TOKEN';

  @prop({
    type: Date,
    required: true,
  })
  public expireAt!: Date;

  @prop({
    type: String,
    required: true,
    minlength: 6,
  })
  public token!: string;

  @prop({
    required: true,
    index: true,
  })
  public userId!: mongoose.Types.ObjectId;

  @prop({
    type: String,
  })
  public deviceName?: string;

  @prop({
    type: String,
  })
  public deviceIp?: string;
}
