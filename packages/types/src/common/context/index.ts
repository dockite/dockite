import { User } from '../../entities';

export interface SessionContext {
  req: Express.Request;
  res: Express.Response;
}

export interface GlobalContext extends SessionContext {
  user?: UserContext;
}

export type UserContext = Omit<User, 'password'>;
