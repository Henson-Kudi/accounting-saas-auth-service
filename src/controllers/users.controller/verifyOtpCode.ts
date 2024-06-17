import { Request, Response } from 'express';
import moment from 'moment';
import ResponseMessage, {
  BadRequestMessage,
  SuccessMessage,
  UnhandledErrorMessage,
} from '../../utils/responseHandler/responseMessage';
import UserSchema from '../../entities/schemas/User.schema';
import { REFRESH_TOKEN_OPTIONS } from '../../utils/constants';
import responseHandler from '../../utils/responseHandler';

export default async function verifyOtpCode(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const data = req.body;

    const lastLoginDevice = req.headers['user-agent']!;
    const lastLoginIp = Array.isArray(req.headers['x-forwarded-for'])
      ? req.headers['x-forwarded-for'][0]!
      : req.headers['x-forwarded-for'];

    const lastLoginLocation = req.headers['geo-location']!;
    const lastLoginAt = moment().toDate();

    const { usersRepository } = req.repositories!;

    const otpData = {
      ...data,
      lastLoginDevice,
      lastLoginIp,
      lastLoginLocation,
      lastLoginAt,
    };

    console.log(otpData, 'otp data')

    const otpUser: {
      accessToken: string;
      refreshToken: string;
      user: UserSchema;
    } | null = await usersRepository!.verifyOtpCode(otpData);

    if (!otpUser) {
      console.log(otpUser, 'otp user')
      throw new BadRequestMessage('Invalid');
    }

    // Clear any refresh token cookie in frontend
    res.clearCookie('refresh-token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    // SET COOKIE FOR THE FRONTEND
    const refreshTokenExpiryDate = moment()
      .add(REFRESH_TOKEN_OPTIONS.expiresIn ?? 86400, 'seconds')
      .toDate(); // defaults to 24hrs (86400 seconds)

    res.cookie('refresh-token', otpUser.refreshToken, {
      httpOnly: true,
      expires: refreshTokenExpiryDate,
      sameSite: 'none',
      // secure: true,
    });

    const successMessage = new SuccessMessage({
      ...otpUser,
      accessToken: otpUser.accessToken,
      refreshToken: otpUser.refreshToken,
    });

    return responseHandler(res, successMessage);

    // res.set
  } catch (err: any) {
    console.log(err)
    if (err instanceof ResponseMessage) {
      return responseHandler(res, err);
    }

    return responseHandler(
      res,
      new UnhandledErrorMessage(err, err?.message ?? 'Unhandled error')
    );
  }
}
