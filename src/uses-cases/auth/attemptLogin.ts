import {Types} from 'mongoose';
import UserSchema from '../../entities/schemas/User.schema';
import {IUsersDb} from '../../types/dataaccess';
import IServices from '../../types/services';
import attemptGoogleLogin from './attemptGoogleLogin';
import attemptNormalLogin from './attemptNormalLogin';
import environment from '../../utils/environment';
import {UnhandledErrorMessage} from '../../utils/responseHandler/responseMessage';
import {
  ACCESS_TOKEN_OPTIONS,
  REFRESH_TOKEN_OPTIONS,
} from '../../utils/constants';
import moment from 'moment';

export default async function attemptLogin(
  data: {[key: string]: unknown},
  db: IUsersDb,
  services: IServices
): Promise<{
  accessToken: string;
  refreshToken: string;
  user: UserSchema;
} | null> {
  if (!data) {
    return null;
  }

  let loggedInUser: UserSchema | null = null;

  switch (data.type) {
    case 'google':
      loggedInUser = await attemptGoogleLogin(data, db);
      break;
    case 'apple':
      // loggedInUser = await attemptAppleLogin(loginData, repository!);
      break;
    default:
      if (
        !data.email ||
        !data.password ||
        !(data.email instanceof String) ||
        !(data.password instanceof String)
      ) {
        return null;
      }

      loggedInUser = await attemptNormalLogin(
        {email: data.email.toString(), password: data.password.toString()},
        db
      );
      break;
  }

  // if not user, throw err
  if (!loggedInUser) {
    return null;
  }

  const {jwtService} = services;

  // Generate tokens
  const accessKey = environment.jwt.accessKey;

  const refreshKey = environment.jwt.refreshKey;

  if (!accessKey.privateKey || !refreshKey.privateKey) {
    throw new UnhandledErrorMessage('Unexpected error occured');
  }

  const accessToken = jwtService.generateJWtToken(
    {
      userId: loggedInUser?.id ?? loggedInUser._id?.toString(),
      audience: '*',
      issuer: accessKey.name,
    },
    {
      key: accessKey.privateKey,
      passphrase: accessKey.passPhrase,
    },
    {
      expiresIn: '15m',
      keyId: accessKey.name,
    }
  );

  const refreshToken = jwtService.generateJWtToken(
    {
      userId: loggedInUser.id ?? loggedInUser._id.toString(),
      audience: '*',
      issuer: refreshKey.name,
    },
    {
      key: refreshKey.privateKey,
      passphrase: refreshKey.passPhrase,
    },
    {
      expiresIn: '24h',
      keyId: refreshKey.name,
    }
  );

  // Delete any previous tokens in the db for this device
  await db.deleteTokens({
    userId:
      loggedInUser?._id ?? Types.ObjectId.createFromHexString(loggedInUser?.id),
    deviceName: data?.lastLoginDevice,
    deviceIp: data?.lastLoginIp,
  });

  // Create new tokens for the user
  const refreshTokenExpiryDate = moment()
    .add(REFRESH_TOKEN_OPTIONS.expiresIn ?? 86400, 'seconds')
    .toDate(); // defaults to 24hrs (86400 seconds)

  const accessTokenExpiryDate = moment()
    .add(ACCESS_TOKEN_OPTIONS.expiresIn ?? 900, 'seconds') // defaults to 15mins (900 seconds)
    .toDate();

  const tokens: {[key: string]: unknown}[] = [
    {
      expireAt: refreshTokenExpiryDate,
      token: refreshToken,
      type: 'REFRESH_TOKEN',
      userId:
        loggedInUser._id ?? Types.ObjectId.createFromHexString(loggedInUser.id),
      deviceIp: data?.lastLoginIp,
      deviceName: data?.lastLoginDevice,
    },
    {
      expireAt: accessTokenExpiryDate,
      token: accessToken,
      type: 'ACCESS_TOKEN',
      userId:
        loggedInUser._id ?? Types.ObjectId.createFromHexString(loggedInUser.id),
      deviceIp: data?.lastLoginIp,
      deviceName: data?.lastLoginDevice,
    },
  ];

  await db.createToken(tokens);

  return {
    accessToken,
    refreshToken,
    user: loggedInUser,
  };
}
