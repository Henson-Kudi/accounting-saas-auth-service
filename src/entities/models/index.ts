import {getModelForClass} from '@typegoose/typegoose';
import UserSchema from '../schemas/User.schema';
import UserTokensSchema from '../schemas/UserTokens.schema';

export const UserModel = getModelForClass(UserSchema);

// UserTokens model
export const UserTokenModel = getModelForClass(UserTokensSchema);
