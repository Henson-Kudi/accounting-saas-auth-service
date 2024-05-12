import {Request, Response} from 'express';
import responseHandler from '../../utils/responseHandler';
import ResponseMessage, {
  BadRequestMessage,
  SuccessMessage,
  UnhandledErrorMessage,
} from '../../utils/responseHandler/responseMessage';
import generateRandomNumber from '../../utils/randomNumber';
import moment from 'moment';
import UserSchema from '../../entities/schemas/User.schema';
import {Types} from 'mongoose';
import environment from '../../utils/environment';

export default async function registerUser(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const data = req.body;

    const now = moment().toDate();

    // Check if data is provided
    if (!data) {
      return responseHandler(res, new BadRequestMessage('No data provided'));
    }

    // Setup repository
    const {usersRepository} = req.repositories!;
    const {emailService} = req.services!;

    // Register user
    const user = (await usersRepository!.registerUser({
      ...(data ?? {}),
      lastLoginDevice: req.headers['user-agent']!,
      lastLoginIp: req.headers['x-forwarded-for']!,
      lastLoginLocation: req.headers['geo-location']!,
      lastLoginAt: now,
    })) as UserSchema;

    // Send verification email
    // This includes generating otp code, saving in db and sending mail to user.
    // return response.202 so user can input verification code in order to access platform.
    const emailSender = environment.smtp.noReply;

    if (
      emailSender &&
      emailService.verifyEmail(user.email) &&
      emailService.verifyEmail(emailSender)
    ) {
      const otpToken = generateRandomNumber(6);
      const _10minsFromNow = moment().add(10, 'minutes');

      await usersRepository.createToken({
        expireAt: _10minsFromNow.toDate(),
        token: otpToken,
        type: 'OTP',
        userId: user._id ?? Types.ObjectId.createFromHexString(user.id),
      });

      await emailService.sendMail({
        from: emailSender,
        to: user.email,
        html: `
        <p>Thank you for registering.</p>
        <h1>Your one time otp code</h1>
        <p>${otpToken}</p>
        `,
      });
    }

    // IT MIGHT BE A GOOD IDEA TO RETURN ACCESS TOKEN AND CODE. ACCESS TOKEN CAN BE DECODED TO GET USER INFOS WHICH WOULD BE USED TO VERIFY THE OTP CODE BEING SENT.

    // Return response to client
    return responseHandler(
      res,
      new SuccessMessage(user!, 'User registered successfully', 202)
    );
  } catch (err: any) {
    // Handle error response from repository
    if (err instanceof ResponseMessage) {
      return responseHandler(res, err);
    }
    return responseHandler(res, new UnhandledErrorMessage(err, err?.message));
  }
}
