import jwt from 'jsonwebtoken';

export const verify = <T>(token: string, secret: jwt.Secret, options?: jwt.DecodeOptions): T => {
  // Thanks typescript
  return (jwt.verify(token, secret, options) as unknown) as T;
};
