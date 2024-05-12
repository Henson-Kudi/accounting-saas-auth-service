import Jwt from 'jsonwebtoken';
import JWTService from '../types/services/JWTService';
import UserSchema from '../entities/schemas/User.schema';

const jwtService: JWTService = {
  generateJWtToken: (
    payload: {
      issuer: string; //this is service issuing the token. In our case only aith service will issue tokens so it'll be in env file. if any organization wants to use our api, organization id is required here
      audience: string | string[]; // The audience that this token is intended for (List of services provided by HK). '*' would mean all services
      userId?: string; // user id of the user who is accessing the resource from our app or website
    },
    secret: {key: string | Buffer; passphrase: string},
    options: {
      keyId: string;
      algorithm?: 'RS256';
      type?: 'JWT';
      expiresIn: string | number; // number of seconds after which token will expire.
    }
  ): string => {
    if (options.type !== 'JWT') {
      throw new Error('Invalid token type. Must be JWT');
    }

    if (options.algorithm !== 'RS256') {
      throw new Error('Invalid algorithm. Must be RS256');
    }

    const Payload: Jwt.JwtPayload = {
      iss: payload.issuer,
      aud: payload.audience,
      userId: payload.userId,
    };

    const generated = Jwt.sign(Payload, secret, {
      expiresIn: options.expiresIn,
      header: {
        alg: options.algorithm ?? 'RS256',
        typ: options.type ?? 'JWT',
        kid: options.keyId,
      },
    });

    return generated;
  },

  verifyToken: (token: string, publicKey: string): Jwt.JwtPayload => {
    const verified = Jwt.verify(token, publicKey) as Jwt.JwtPayload & {
      user: Pick<UserSchema, 'id' | 'email' | 'name'>;
    };

    return verified;
  },

  decodeToken: (token: string): Jwt.Jwt | null => {
    return Jwt.decode(token, {
      complete: true,
      json: true,
    });
  },
};

export default jwtService;
