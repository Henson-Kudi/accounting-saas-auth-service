import {isValidObjectId, Types} from 'mongoose';
import UserSchema from '../../entities/schemas/User.schema';
import {IUsersDb} from '../../types/dataaccess';
import IServices from '../../types/services';
import environment from '../../utils/environment';
import {UnhandledErrorMessage} from '../../utils/responseHandler/responseMessage';
import {
  ACCESS_TOKEN_OPTIONS,
  REFRESH_TOKEN_OPTIONS,
} from '../../utils/constants';
import moment from 'moment';

export default async function refreshToken(
  params: {[key: string]: unknown} & {token: string},
  db: IUsersDb,
  services: IServices
): Promise<{
  accessToken: string;
  refreshToken: string;
  user: UserSchema;
} | null> {
  const {token, ...data} = params;

  const refreshKey = environment.jwt.refreshKey;
  const accessKey = environment.jwt.accessKey;

  const {jwtService} = services;

  const decoded = jwtService.decodeToken(token);

  if (!decoded) {
    return null;
  }

  const payload = decoded?.payload;

  const headers = decoded.header;

  if (!payload || typeof payload === 'string') {
    return null;
  }

  // If no audience or no issuer or no keyid,..., throw error
  if (
    !payload.aud ||
    !payload.iss ||
    !payload.exp ||
    !payload.iat ||
    !payload?.userId ||
    !isValidObjectId(payload.userId)
  ) {
    return null;
  }

  if (
    headers.kid !== refreshKey.name ||
    headers.alg !== 'RS256' ||
    headers.typ !== 'JWT'
  ) {
    return null;
  }

  // Verify token

  if (
    !refreshKey.privateKey ||
    !accessKey.privateKey ||
    !refreshKey.publicKey
  ) {
    throw new UnhandledErrorMessage(new Error('unexpected error occured'));
  }

  const verified = jwtService.verifyToken(token, refreshKey.publicKey);

  if (!verified || !verified.userId) {
    return null;
  }

  const foundUser = await db.findUserById(
    Types.ObjectId.createFromHexString(verified.userId)
  );

  if (
    !foundUser ||
    !foundUser.isActive ||
    foundUser.isDeleted ||
    !foundUser.emailVerified
  ) {
    return null;
  }

  // generate new access and refresh tokens

  const accessToken = jwtService.generateJWtToken(
    {
      userId: foundUser.id ?? foundUser?._id.toString(),
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
      userId: foundUser?.id ?? foundUser?._id?.toString(),
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

  if (!accessToken || !refreshToken) {
    throw new UnhandledErrorMessage(new Error('unexpected error occured'));
  }

  // Delete any previous tokens in the db for this device
  await db.deleteTokens({
    userId: foundUser._id ?? Types.ObjectId.createFromHexString(foundUser.id),
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
      token: foundUser,
      type: 'REFRESH_TOKEN',
      userId: foundUser._id ?? Types.ObjectId.createFromHexString(foundUser.id),
      deviceIp: data.lastLoginIp,
      deviceName: data.lastLoginDevice,
    },
    {
      expireAt: accessTokenExpiryDate,
      token: foundUser,
      type: 'ACCESS_TOKEN',
      userId: foundUser._id ?? Types.ObjectId.createFromHexString(foundUser.id),
      deviceIp: data.lastLoginIp,
      deviceName: data.lastLoginDevice,
    },
  ];

  await db.createToken(tokens);

  return {
    accessToken,
    refreshToken,
    user: foundUser,
  };
}
