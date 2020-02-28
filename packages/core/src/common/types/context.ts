import { Request, Response } from 'express';

import { User } from '../../entities';

export interface SessionContext {
  req: Request;
  res: Response;
}

export interface RootContext {
  user?: UserContext;
}

export type UserContext = Exclude<User, 'password'>;
