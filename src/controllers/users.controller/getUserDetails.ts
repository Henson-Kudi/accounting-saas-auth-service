import {Request, Response} from 'express';
import ResponseMessage, {
  ForbiddenMessage,
  NotFoundMessage,
  SuccessMessage,
  UnhandledErrorMessage,
} from '../../utils/responseHandler/responseMessage';
import responseHandler from '../../utils/responseHandler';
import {Types} from 'mongoose';

export default async function getUserDetails(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const user = req.user;

    const {usersRepository} = req.repositories!;

    if (!user) {
      throw new ForbiddenMessage();
    }

    const foundUser = await usersRepository.findUserById(
      user._id ?? Types.ObjectId.createFromHexString(user.id)
    );

    if (!foundUser || !foundUser.isActive || foundUser.isDeleted) {
      throw new NotFoundMessage();
    }

    return responseHandler(res, new SuccessMessage(foundUser));
  } catch (err) {
    console.log('error returned here');
    if (err instanceof ResponseMessage) {
      return responseHandler(res, err);
    }

    return responseHandler(
      res,
      new UnhandledErrorMessage(new Error('Unexpected server error'))
    );
  }
}
