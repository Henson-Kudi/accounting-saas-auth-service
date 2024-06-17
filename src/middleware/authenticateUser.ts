import { Request, Response, NextFunction } from 'express';
import { UnauthorizedMessage } from '../utils/responseHandler/responseMessage';
import authenticateUser from '../uses-cases/auth/authenticateUser';

export default async function authenticateMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.headers.authorization;

    if (!token || !token.startsWith('Bearer')) {
      throw new UnauthorizedMessage('Invalid token');
    }

    const foundUser = await authenticateUser(token, req.repositories!);

    req.user = foundUser;
    next();
  } catch (err) {
    next(err);
  }
}
