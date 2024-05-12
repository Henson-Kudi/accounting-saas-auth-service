import {Response, Request} from 'express';
import ResponseMessage, {
  BadRequestMessage,
  SuccessMessage,
  UnhandledErrorMessage,
} from '../../utils/responseHandler/responseMessage';
import responseHandler from '../../utils/responseHandler';
import {REFRESH_TOKEN_OPTIONS} from '../../utils/constants';
import moment from 'moment';

export default async function attemptLogin(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const data = req.body;
    const {usersRepository} = req.repositories!;

    // clear any cookies in frontend
    res.clearCookie('refresh-token');

    // If google login, login using google

    // if apple login login using apple

    // if normal login, login using  normal
    const now = moment().toDate();

    const loginData = {
      ...data,
      lastLoginDevice: req.headers['user-agent']!,
      lastLoginIp: Array.isArray(req.headers['x-forwarded-for'])
        ? req.headers['x-forwarded-for'][0]
        : req.headers['x-forwarded-for']!,
      lastLoginLocation: req.headers['geo-location']!,
      lastLoginAt: now,
    };

    const loggedInUser = await usersRepository.attemptLogin(loginData);

    if (
      !loggedInUser ||
      !loggedInUser.accessToken ||
      !loggedInUser.refreshToken ||
      !loggedInUser.user
    ) {
      throw new BadRequestMessage('Invalid credentials');
    }

    // SET COOKIE FOR THE FRONTEND
    const refreshTokenExpiryDate = moment()
      .add(REFRESH_TOKEN_OPTIONS.expiresIn ?? 86400, 'seconds')
      .toDate(); // defaults to 24hrs (86400 seconds)

    res.cookie('refresh-token', loggedInUser.refreshToken, {
      httpOnly: true,
      expires: refreshTokenExpiryDate,
      sameSite: 'none',
      // secure: true,
    });

    const successMessage = new SuccessMessage(loggedInUser, 'Login successful');

    return responseHandler(res, successMessage);
  } catch (err: any) {
    if (err instanceof ResponseMessage) {
      return responseHandler(res, err);
    }
    return responseHandler(res, new UnhandledErrorMessage(err.message));
  }
}
