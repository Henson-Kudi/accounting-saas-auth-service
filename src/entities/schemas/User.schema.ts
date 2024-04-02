import Joi from '@hapi/joi';
import {prop} from '@typegoose/typegoose';
import BaseDocument from './baseDoc';
import Address from '../../types/address';
import Contact from '../../types/contact';

const emailValidator = Joi.string().email();

class AddressSchema implements Address {
  public line1!: string;
  public line2?: string | undefined;
  public line3?: string | undefined;
  public type!: 'Home' | 'Work' | 'Other';
}

class ContactSchema implements Contact {
  public phone!: string;
  public type!: 'Home' | 'Work' | 'Mobile' | 'WhatsApp' | 'Main';
}

export default class UserSchema extends BaseDocument {
  constructor(
    data: Pick<UserSchema, 'name' | 'email' | 'addresses' | 'contacts'> &
      Omit<UserSchema, '_id' | 'id' | 'updatedAt'>
  ) {
    super();

    this.name = data.name;
    this.email = data.email;
    this.addresses = data.addresses;
    this.contacts = data.contacts;
    data.createdAt && (this.createdAt = data?.createdAt);
  }

  @prop({
    required: true,
    trim: true,
    index: true,
    maxlength: 52,
    minlength: 3,
  })
  public name!: string;

  @prop({
    required: true,
    trim: true,
    index: true,
    maxlength: 52,
    minlength: 5,
    unique: true,
    lowercase: true,
    validate: {
      validator: (value: string) => {
        const {error} = emailValidator.validate(value);
        return !error;
      },
      message: (props: any) =>
        props?.reason?.message ?? 'Invalid email address',
    },
  })
  public email!: string;

  @prop({required: true, type: () => [AddressSchema]})
  public addresses!: AddressSchema[];

  @prop({required: true, type: () => [ContactSchema]})
  public contacts!: ContactSchema[];

  @prop({required: false, default: true})
  public isActive?: boolean;

  @prop({required: false, default: false})
  public isDeleted?: boolean;
}
