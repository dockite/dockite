import { AuthenticationError } from 'apollo-server-express';
import { createMethodDecorator } from 'type-graphql';

import { GlobalContext } from '@dockite/types';

/**
 * Determines whether the current user is authenticated.
 *
 * Intended to run as a middleware for resolvers.
 */
export const Authenticated = (): MethodDecorator => {
  return createMethodDecorator<GlobalContext>(({ context }, next) => {
    if (!context.user) {
      throw new AuthenticationError(
        'You are not currently authenticated, please log in and try again.',
      );
    }

    return next();
  });
};

export default Authenticated;
