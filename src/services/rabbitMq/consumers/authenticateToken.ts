import { ConsumeMessage } from 'amqplib';
import ResponseMessage, {
  BadRequestMessage,
} from '../../../utils/responseHandler/responseMessage';
import authenticateUser from '../../../uses-cases/auth/authenticateUser';
import Repository from '../../../uses-cases';
import UsersDb from '../../../data-access/users.db';
import services from '../..';

export default async function authenticateToken(msg: ConsumeMessage) {
  try {
    if (!msg.content) {
      throw new BadRequestMessage('invalid  token');
    }

    const requestData = JSON.parse(msg!.content.toString());

    console.log(requestData, 'request data');

    const decoded = await authenticateUser(requestData.token ?? '', new Repository(new UsersDb(), services));

    return decoded;
  } catch (err) {
    if (err instanceof ResponseMessage) {
      console.log('error', err);
      const decoded = {
        error: {
          message: err?.message,
          code: err?.statusCode,
        },
      };
      return decoded;
    } else {
      return {
        error: {
          code: 500,
          message: 'Unexpected server error!',
        },
      };
    }
  }
}
