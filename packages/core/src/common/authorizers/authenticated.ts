import { AuthChecker, createMethodDecorator } from 'type-graphql';
import { AuthenticationError } from 'apollo-server-express';

import { GlobalContext } from '../types';

export const authChecker: AuthChecker<GlobalContext> = ({ context }): boolean => {
  return !!context.user;
};

export const Authenticated = (): MethodDecorator =>
  createMethodDecorator<GlobalContext>(({ context }, next) => {
    if (!context.user) {
      throw new AuthenticationError('Not authenticated');
    }

    return next();
  });
