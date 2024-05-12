export const REFRESH_TOKEN_OPTIONS = {
  expiresIn: 86400, //24hours in seconds
  algorithm: 'RS256',
  type: 'JWT',
};

export const ACCESS_TOKEN_OPTIONS = {
  expiresIn: 900, //15mins in seconds
  algorithm: 'RS256',
  type: 'JWT',
};
