import {Response} from 'express';
import ResponseMessage from './responseMessage';

export default function responseHandler(
  res: Response,
  message: ResponseMessage
): Response {
  return res.status(message.statusCode).json(message);
}
