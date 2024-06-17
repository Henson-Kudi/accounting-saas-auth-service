import humanInterval from 'human-interval';
import {UnauthorizedMessage} from '../../utils/responseHandler/responseMessage';
import {JwtPayload} from 'jsonwebtoken';
import UserSchema from '../../entities/schemas/User.schema';
import services from '../../services';
import environment from '../../utils/environment';
import {Types} from 'mongoose';
import RepositoryLocator from '../../types/RepositoryLocator';

export default async function authenticateUser(token: string, repositories:RepositoryLocator) {
  if (!token || !token.startsWith('Bearer')) {
    throw new UnauthorizedMessage('Invalid token');
  }

  const authToken = token.split(' ')[1];

  if (!authToken) {
    throw new UnauthorizedMessage('Invalid token');
  }

  const {usersRepository} = repositories;

  const {jwtService, redisService} = services!;

  const decodedToken = jwtService.decodeToken(authToken);

  if (!decodedToken) {
    throw new UnauthorizedMessage('Invalid token');
  }
  // Ensure that decodedToken has:
  // -issuer, -keyid, -audience
  // expiry is not more than 20mins
  const payload = decodedToken.payload;

  const headers = decodedToken.header;

  if (
    !payload ||
    typeof payload === 'string' ||
    !payload.iss ||
    !payload?.userId ||
    !payload.aud ||
    !payload.exp ||
    !payload.iat
  ) {
    throw new UnauthorizedMessage('Invalid token');
  }

  if (!headers.kid || headers.alg !== 'RS256' || headers.typ !== 'JWT') {
    throw new UnauthorizedMessage('Invalid token');
  }

  // Throw error if token is valid for more than 20 minutes
  const _20mins = humanInterval('20 minutes')! / 1000; //20 minutes in seconds

  if (payload.exp - payload.iat > _20mins) {
    throw new UnauthorizedMessage('Token cannot be more than 20 minutes');
  }

  let verifiedPayload: JwtPayload | undefined;

  const foundUser: UserSchema | null = await usersRepository.findUserById(
    Types.ObjectId.createFromHexString(payload.userId)
  );

  if (!foundUser) {
    throw new UnauthorizedMessage('Invalid token');
  }

  // if foundUser is not active, throw error
  if (!foundUser.isActive) {
    throw new UnauthorizedMessage('User is not active');
  }

  // if foundUser is not active, throw error
  if (foundUser.isDeleted) {
    throw new UnauthorizedMessage('Invalid token');
  }

  // if foundUser is not verified, throw error
  if (!foundUser.emailVerified) {
    throw new UnauthorizedMessage('Please  verify your email');
  }

  // if decodedToken's issuer is our local sytem, then use environment.accessKey, else fetch key from redis key-store

  if (payload.iss === environment.jwt.accessKey.name) {
    //If we decide to save the local auth private keys in redis, no need to switch, maintain the else block
    // const user = await usersRepository.findUserById(
    //   Types.ObjectId.createFromHexString(payload.userId)
    // );

    // foundUser = user;

    verifiedPayload = jwtService.verifyToken(
      authToken,
      environment.jwt.accessKey.publicKey
    );
  } else {
    const result = await redisService.getItem(headers.kid);

    if (!result) {
      throw new UnauthorizedMessage('Invalid token');
    }

    const jsonData = JSON.parse(result);

    if (!jsonData.userId || !jsonData.key) {
      throw new UnauthorizedMessage('Invalid token');
    }

    verifiedPayload = jwtService.verifyToken(authToken, jsonData.key);
  }

  if (!verifiedPayload) {
    throw new UnauthorizedMessage('Invalid token');
  }

  return foundUser;
}
