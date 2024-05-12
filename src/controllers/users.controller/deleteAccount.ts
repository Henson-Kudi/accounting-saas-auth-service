import {Request, Response} from 'express';
import ResponseMessage, {
  ForbiddenMessage,
  NotFoundMessage,
  SuccessMessage,
  UnhandledErrorMessage,
  ValidationMessage,
} from '../../utils/responseHandler/responseMessage';
import {Types} from 'mongoose';
import responseHandler from '../../utils/responseHandler';
import Joi from '@hapi/joi';
export default async function deleteAccount(req: Request, res: Response) {
  try {
    const {usersRepository} = req.repositories!;

    const user = req.user;

    if (!user) {
      throw new ForbiddenMessage();
    }

    const updateData = {
      isDeleted: true,
    };

    const updatedUser = await usersRepository.findUserByIdAndUpdate(
      user._id ?? Types.ObjectId.createFromHexString(user.id),
      updateData
    );

    if (!updatedUser) {
      throw new NotFoundMessage();
    }

    const success = new SuccessMessage(updatedUser);

    return responseHandler(res, success);
  } catch (err) {
    if (err instanceof ResponseMessage) {
      return responseHandler(res, err);
    }

    if (err instanceof Joi.ValidationError) {
      return responseHandler(res, new ValidationMessage(err, err?.message));
    }

    return responseHandler(
      res,
      new UnhandledErrorMessage(new Error('Unexpected server error'))
    );
  }
}
