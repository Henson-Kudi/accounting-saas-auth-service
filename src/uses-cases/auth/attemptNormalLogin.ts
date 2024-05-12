import UserSchema from '../../entities/schemas/User.schema';
import {IUsersDb} from '../../types/dataaccess';
import {BadRequestMessage} from '../../utils/responseHandler/responseMessage';

export default async function attemptNormalLogin(
  data: {email: string; password: string},
  database: IUsersDb
): Promise<UserSchema | null> {
  if (!data.email || !data.password) {
    return null;
  }

  const user = await database.findUserByEmail(data.email as string);

  if (!user) {
    return null;
  }

  if (user.isDeleted || !user.isActive) {
    return null;
  }

  if (user.googleId || user.appleId) {
    throw new BadRequestMessage('Please login with your social account');
  }

  const isMatch = await user.comparePassword!(data.password);

  if (!isMatch) {
    return null;
  }

  return user;
}
