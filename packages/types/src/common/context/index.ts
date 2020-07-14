import * as express from 'express';

import { User } from '../../entities';

export interface SessionContext {
  req: express.Request;
  res: express.Response;
}

export interface GlobalContext extends SessionContext {
  user?: UserContext;
}

export type UserContext = Omit<User, 'password'>;
