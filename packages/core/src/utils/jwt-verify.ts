import jwt from 'jsonwebtoken';

export const verify = <T extends object>(
  token: string,
  secret: jwt.Secret,
  options?: jwt.DecodeOptions,
): T => {
  return jwt.verify(token, secret, options) as T;
};
