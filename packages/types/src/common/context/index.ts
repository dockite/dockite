import * as express from 'express';
import { GraphQLSchema } from 'graphql';

import { User } from '../../entities';

export interface SessionContext {
  req: express.Request;
  res: express.Response;
}

export interface GlobalContext extends SessionContext {
  user?: UserContext;
  schema: GraphQLSchema;
}

export type UserContext = Omit<User, 'password'>;
