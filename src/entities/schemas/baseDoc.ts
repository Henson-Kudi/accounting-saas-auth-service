import {modelOptions} from '@typegoose/typegoose';
import {Base, TimeStamps} from '@typegoose/typegoose/lib/defaultClasses';
import {Types} from 'mongoose';

interface BaseDocument extends Base {}

@modelOptions({
  schemaOptions: {
    virtuals: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  },
})

class BaseDocument extends TimeStamps {
  constructor() {
    super();
    this._id = new Types.ObjectId();
  }
}

export default BaseDocument;
