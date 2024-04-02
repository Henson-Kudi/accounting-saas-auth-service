import {getModelForClass} from '@typegoose/typegoose';
import UserSchema from '../schemas/User.schema';

export const UserModel = getModelForClass(UserSchema);
