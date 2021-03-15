import { GraphQLSchema } from 'graphql';

import { User } from '@dockite/database';
import { GlobalContext, SessionContext } from '@dockite/types';

import { exchangeAuth0TokenForUser } from '../../../auth';
import {
  exchangeApiKeyForUser,
  exchangeBearerTokenForUser,
  exchangeRefreshTokenForUser,
} from '../../../auth/internal';
import { getConfig } from '../../config';
import { createJwtTokenForUser, isInternalAuth } from '../../util';

export type BaseContext = SessionContext;

/**
 * Provided the base context from `apollo-server-express` construct a new global context which will include
 * user details and helpful attributes.
 */
export const createGlobalContext = async (
  ctx: BaseContext,
  schema: GraphQLSchema,
): Promise<GlobalContext> => {
  const config = getConfig();

  // Firstly we will deconstruct the base context so that we can add it back later.
  const { req, res } = ctx;

  const authorizationHeader = req.headers.authorization ?? '';
  const refreshToken: string = req.cookies.refreshToken ?? '';

  const apiKey = (req.headers['x-dockite-token'] ?? req.query['x-dockite-token']) as
    | string
    | undefined;

  // If an API Key is present, attempt to exchange the api key for a user and set the context
  if (apiKey) {
    const user = await exchangeApiKeyForUser(apiKey);

    if (user) {
      return {
        req,
        res,
        user,
        schema,
      };
    }
  }

  // If an authorization header is present, attempt to decode the provided token and set the context
  if (authorizationHeader) {
    let user: User | null;

    if (isInternalAuth(config.auth)) {
      user = exchangeBearerTokenForUser(authorizationHeader, config);
    } else {
      user = await exchangeAuth0TokenForUser(authorizationHeader, config);
    }

    if (user) {
      return {
        req,
        res,
        user,
        schema,
      };
    }
  }

  // If a refresh token is present and we're using the internal authentication module,
  // attempt to decode the provided token and set the context
  if (refreshToken && isInternalAuth(config.auth)) {
    const user = await exchangeRefreshTokenForUser(refreshToken, config);

    if (user) {
      createJwtTokenForUser(user, res);

      return {
        req,
        res,
        user,
        schema,
      };
    }
  }

  // Finally if no other matching context was found, set the context without an assigned user
  return {
    req,
    res,
    user: undefined,
    schema,
  };
};
