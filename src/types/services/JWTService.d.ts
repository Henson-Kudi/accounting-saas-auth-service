import Jwt from 'jsonwebtoken';

export default interface JWTService {
  generateJWtToken: (
    payload: {
      issuer: string; //this is service issuing the token. In our case only aith service will issue tokens so it'll be in env file. if any organization wants to use our api, organization id is required here
      audience: string | string[]; // The audience that this token is intended for (List of services provided by HK). '*' would mean all services
      userId?: string; // user id of the user who is accessing the resource from our app or website
    },
    secret: {key: string | Buffer; passphrase: string},
    options: {
      expiresIn: string | number; // number of seconds after which token will expire.
      keyId: string;
      algorithm?: 'RS256';
      type?: 'JWT';
    }
  ) => string;

  verifyToken: (token: string, publicKey: string) => Jwt.JwtPayload;
  decodeToken: (token: string) => Jwt.Jwt | null;
}
