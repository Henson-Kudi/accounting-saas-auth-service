import {Request, Response} from 'express';
import ResponseMessage, {
  BadRequestMessage,
  ForbiddenMessage,
  NotFoundMessage,
  SuccessMessage,
  UnhandledErrorMessage,
  ValidationMessage,
} from '../../utils/responseHandler/responseMessage';
import responseHandler from '../../utils/responseHandler';
import {Types} from 'mongoose';
import moment from 'moment';
import Joi from '@hapi/joi';
import {updateSchema} from '../../utils/validators/user.validator';
export default async function updateAccountInfo(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const data = req.body;
    const {usersRepository} = req.repositories!;
    const now = moment().toDate();

    const user = req.user;

    if (!user || !data) {
      throw new ForbiddenMessage();
    }

    // validate update data
    await updateSchema.validateAsync(data, {abortEarly: false});

    const updatedUser = await usersRepository.findUserByIdAndUpdate(
      user._id ?? Types.ObjectId.createFromHexString(user.id),
      data
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
