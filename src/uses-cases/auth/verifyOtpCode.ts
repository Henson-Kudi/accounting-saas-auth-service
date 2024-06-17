import { isValidObjectId, Types } from 'mongoose';
import UserSchema from '../../entities/schemas/User.schema';
import { IUsersDb } from '../../types/dataaccess';
import environment from '../../utils/environment';
import { UnhandledErrorMessage } from '../../utils/responseHandler/responseMessage';
import IServices from '../../types/services';
import moment from 'moment';
import {
  ACCESS_TOKEN_OPTIONS,
  REFRESH_TOKEN_OPTIONS,
} from '../../utils/constants';

export default async function verifyOtpCode(
  data: {
    [key: string]: unknown;
  },
  db: IUsersDb,
  services: IServices
): Promise<{
  accessToken: string;
  refreshToken: string;
  user: UserSchema;
} | null> {
  let user: UserSchema | null = null;
  const { jwtService, emailService } = services;

  if (
    !data.otpCode ||
    (!data.userId && !(data.email as string)?.trim()) ||
    (data.userId && !isValidObjectId(data.userId)) ||
    ((data.email as string)?.trim() &&
      !emailService.verifyEmail((data.email as string)?.trim()?.toLowerCase()))
  ) {
    return null;
  }

  if (data.userId) {
    const foundUser = await db.findUserById(
      Types.ObjectId.createFromHexString(data.userId as string)
    );

    if (foundUser && foundUser.isActive && !foundUser.isDeleted) {
      user = foundUser;
    }
  } else {
    const foundUser = await db.findUserByEmail(
      (data.email as string)?.trim()?.toLowerCase()
    );

    if (foundUser && !foundUser.isDeleted && foundUser.isActive) {
      user = foundUser;
    }
  }

  if (!user) {
    return null;
  }

  const foundCode = await db.findToken({
    userId: user._id,
    token: data.otpCode as string,
  });

  if (!foundCode) {
    return null;
  }

  // till this level then otp is valid. So delete token from db to ensure it is used just once
  await db.deleteTokens({ _id: foundCode._id });

  // Get private key from aws service
  const accessKey = environment.jwt.accessKey;
  const refreshKey = environment.jwt.refreshKey;

  if (!accessKey.privateKey || !refreshKey.privateKey) {
    throw new UnhandledErrorMessage('Unexpected server error');
  }

  const refreshTokenExpiryDate = moment()
    .add(REFRESH_TOKEN_OPTIONS.expiresIn ?? 86400, 'seconds')
    .toDate(); // defaults to 24hrs (86400 seconds)

  const accessTokenExpiryDate = moment()
    .add(ACCESS_TOKEN_OPTIONS.expiresIn ?? 900, 'seconds') // defaults to 15mins (900 seconds)
    .toDate();

  // generate  jwt tokens and let the user to login

  const accessToken = jwtService.generateJWtToken(
    {
      userId: user.id ?? user?._id?.toString(),
      audience: '*',
      issuer: accessKey.name,
    },
    {
      key: accessKey.privateKey,
      passphrase: accessKey.passPhrase,
    },
    {
      expiresIn: 900, //15mins in seconds
      keyId: accessKey.name,
    }
  );

  const refreshToken = jwtService.generateJWtToken(
    {
      userId: user.id ?? user?._id.toString(),
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

  // delete any tokens in db for this device
  await db.deleteTokens({
    type: { $in: ['REFRESH_TOKEN', 'ACCESS_TOKEN'] },
    userId: user._id ?? Types.ObjectId.createFromHexString(user.id),
    deviceIp: data.lastLoginIp,
    deviceName: data.lastLoginDevice,
  });

  // Save new tokens to db
  const tokens: { [key: string]: unknown }[] = [
    {
      expireAt: refreshTokenExpiryDate,
      token: refreshToken,
      type: 'REFRESH_TOKEN',
      userId: user._id ?? Types.ObjectId.createFromHexString(user.id),
      deviceIp: data.lastLoginIp,
      deviceName: data.lastLoginDevice,
    },
    {
      expireAt: accessTokenExpiryDate,
      token: accessToken,
      type: 'ACCESS_TOKEN',
      userId: user._id ?? Types.ObjectId.createFromHexString(user.id),
      deviceIp: data.lastLoginIp,
      deviceName: data.lastLoginDevice,
    },
  ];

  await db.createToken(tokens);

  // Update User's last login
  const updatedUser = await db.findUserByIdAndUpdate(
    user._id ?? Types.ObjectId.createFromHexString(user.id),
    {
      lastLoginAt: data?.lastLoginAt,
      lastLoginDevice: data?.lastLoginDevice,
      lastLoginIp: data?.lastLoginIp,
      lastLoginLocation: data?.lastLoginLocation,
    }
  );

  return {
    accessToken,
    refreshToken,
    user: updatedUser!,
  };
}
