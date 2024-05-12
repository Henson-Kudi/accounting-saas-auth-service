import {OAuth2Client} from 'google-auth-library';
import mongoose from 'mongoose';
import UserSchema from '../../entities/schemas/User.schema';
import environment from '../../utils/environment';
import {IUsersDb} from '../../types/dataaccess';

export default async function attemptGoogleLogin(
  data: {[key: string]: unknown},
  database: IUsersDb
): Promise<UserSchema | null> {
  if (data.type !== 'google') {
    return null;
  }

  if (!data.idToken) {
    return null;
  }

  const googleClientId = environment.google.oauthClientId;
  const googleClientSecret = environment.google.oauthClientSecret;

  if (!googleClientId || !googleClientSecret) {
    throw new Error('Invalid Google client ID');
  }

  const client = new OAuth2Client(googleClientId, googleClientSecret);

  const ticket = await client.verifyIdToken({
    idToken: data.idToken as string,
    audience: googleClientId,
  });

  const payload = ticket.getPayload();

  if (!payload) {
    return null;
  }

  if (!payload.email_verified) {
    return null;
  }

  if (!payload.sub) {
    return null;
  }

  if (!payload.email) {
    return null;
  }

  // At this level, user is valid google user.
  // We need to check if user already exist so we update data or crete a new user if user does not exist

  let user = await database.findUserByEmail(payload.email);

  if (!user) {
    //Create new user
    user = (await database.createUsers({
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      emailVerified: true,
      googleId: payload.sub,
      lastLoginAt: data.lastLoginAt ?? new Date(),
      lastLoginIp: data.lastLoginIp,
      lastLoginDevice: data.lastLoginDevice,
      lastLoginLocation: data.lastLoginLocation,
    })) as UserSchema;
  }

  let updateData: {[key: string]: unknown} = {
    lastLoginAt: new Date(),
    lastLoginIp: data.lastLoginIp,
    lastLoginDevice: data.lastLoginDevice,
    lastLoginLocation: data.lastLoginLocation,
  };

  if (!user.googleId) {
    updateData = {
      ...updateData,
      googleId: payload.sub,
      emailVerified: true,
      picture: user?.picture ?? payload.picture,
      name: user?.name ?? payload.name,
    };
  }

  const updatedUser = await database.findUserByIdAndUpdate(
    user._id ?? mongoose.Types.ObjectId.createFromHexString(user.id!),
    updateData
  );

  return updatedUser!;
}
