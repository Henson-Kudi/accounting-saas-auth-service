import {prop, index} from '@typegoose/typegoose';
import BaseDocument from './baseDoc';
import mongoose from 'mongoose';

@index({userId: 1, deviceName: 1, deviceIp: 1}, {unique: true})
export default class UserDeviceSchema extends BaseDocument {
  constructor(
    data: Pick<UserDeviceSchema, 'deviceIp' | 'deviceName' | 'userId'> &
      Omit<UserDeviceSchema, '_id' | 'id' | 'updatedAt'>
  ) {
    super();

    Object.assign(this, data);

    data.createdAt && (this.createdAt = data?.createdAt);
  }

  @prop({
    type: mongoose.Types.ObjectId,
    required: true,
    minlength: 6,
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
