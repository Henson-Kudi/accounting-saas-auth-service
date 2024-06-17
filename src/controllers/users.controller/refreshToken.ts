import {Request, Response} from 'express';
import ResponseMessage, {
  ForbiddenMessage,
  SuccessMessage,
  UnhandledErrorMessage,
} from '../../utils/responseHandler/responseMessage';
import responseHandler from '../../utils/responseHandler';
import {REFRESH_TOKEN_OPTIONS} from '../../utils/constants';
import moment from 'moment';
export default async function refreshToken(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const cookies = req.cookies;
    const refreshToken = cookies['refresh-token'];

    // clear existing token
    res.clearCookie('refresh-token');

    const now = moment().toDate();

    const data = {
      token: refreshToken,
      lastLoginDevice: req.headers['user-agent']!,
      lastLoginIp: Array.isArray(req.headers['x-forwarded-for'])
        ? req.headers['x-forwarded-for'][0]
        : req.headers['x-forwarded-for']!,
      lastLoginLocation: req.headers['geo-location']!,
      lastLoginAt: now,
    };

    if (!refreshToken) {
      throw new ForbiddenMessage();
    }

    const {usersRepository} = req.repositories!;

    const refreshedToken = await usersRepository.refreshToken(data);

    if (
      !refreshedToken ||
      !refreshedToken.accessToken ||
      !refreshedToken.refreshToken ||
      !refreshedToken.user
    ) {
      throw new ForbiddenMessage();
    }

    // SET COOKIE FOR THE FRONTEND
    const refreshTokenExpiryDate = moment()
      .add(REFRESH_TOKEN_OPTIONS.expiresIn ?? 86400, 'seconds')
      .toDate(); // defaults to 24hrs (86400 seconds)

    res.cookie('refresh-token', refreshedToken.refreshToken, {
      httpOnly: true,
      expires: refreshTokenExpiryDate,
      sameSite: 'none',
      // secure: true,
    });

    const successMessage = new SuccessMessage(
      refreshedToken,
      'Token refreshed'
    );

    return responseHandler(res, successMessage);
  } catch (err) {
    if (err instanceof ResponseMessage) {
      return responseHandler(res, err);
    }
    return responseHandler(res, new UnhandledErrorMessage(err));
  }
}
