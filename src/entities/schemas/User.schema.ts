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
    data: Pick<
      UserSchema,
      | 'name'
      | 'email'
      | 'addresses'
      | 'contacts'
      | 'lastLoginAt'
      | 'lastLoginIp'
      | 'lastLoginDevice'
      | 'lastLoginLocation'
      | 'googleId'
      | 'appleId'
      | 'picture'
      | 'emailVerified'
      | 'passwordHash'
    > &
      Omit<UserSchema, '_id' | 'id' | 'updatedAt'>
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
      message: () => 'Invalid email address',
    },
  })
  public email!: string;

  @prop({
    required: true,
    default: false,
    select: false,
  })
  public emailVerified?: boolean;

  @prop({required: true, type: String, select: false})
  public passwordHash!: string;

  @prop({required: true, type: () => [AddressSchema]})
  public addresses!: AddressSchema[];

  @prop({required: true, type: () => [ContactSchema]})
  public contacts!: ContactSchema[];

  @prop({required: true, default: new Date()})
  public lastLoginAt!: Date;

  @prop({required: false})
  public lastLoginIp?: string;

  @prop({required: false})
  public lastLoginDevice?: string;

  @prop({required: false})
  public lastLoginLocation?: string;

  @prop({required: false})
  public googleId?: string;

  @prop({required: false})
  public appleId?: string;

  @prop({required: false})
  public picture?: string;

  @prop({required: false, default: true})
  public isActive?: boolean;

  @prop({required: false, default: false})
  public isDeleted?: boolean;

  // public comparePassword?(password: string): boolean {
  //   // const isMatch = passwordService.comparePassword(
  //   //   password,
  //   //   this.passwordHash
  //   // );
  //   return true;
  // }

  // When an owner invites a user, token is generated and if user accepts invitation, redirect to a page to fill required information like contact and addresses
}
