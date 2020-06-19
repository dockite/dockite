import { User } from '@dockite/database';
import { Request, Response } from 'express';

export interface SessionContext {
  req: Request;
  res: Response;
}

export interface GlobalContext extends SessionContext {
  user?: UserContext;
}

export type UserContext = Omit<User, 'password' | 'handleNormalizeScopes' | 'can'>;
