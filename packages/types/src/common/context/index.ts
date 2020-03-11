import { User } from '../../entities';

export interface SessionContext {
  req: Request;
  res: Response;
}

export interface GlobalContext extends SessionContext {
  user?: UserContext;
}

export type UserContext = Omit<User, 'password'>;
