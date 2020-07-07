import { User } from '@dockite/database';
import { GlobalContext, UserContext } from '@dockite/types';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import debug from 'debug';
import { sign } from 'jsonwebtoken';
import { getRepository } from 'typeorm';

import { getConfig } from '../config';

import { verify } from './jwt-verify';

const log = debug('dockite:context:builder');

const config = getConfig();

const exchangeBearerTokenForUser = (bearerToken: string): UserContext | null => {
  const bearerSplit = bearerToken.split('Bearer');
  const token = bearerSplit[bearerSplit.length - 1].trim();

  try {
    const user = verify<UserContext>(token, config.app.secret ?? '');

    return user;
  } catch (err) {
    return null;
  }
};

const exchangeRefreshTokenForUser = async (refreshToken: string): Promise<UserContext | null> => {
  try {
    const refresh = verify<UserContext>(refreshToken, config.app.secret ?? '');

    const user = await getRepository(User).findOneOrFail(refresh.id);

    return user;
  } catch (err) {
    return null;
  }
};

const exchangeAPIKeyForUser = async (apiKey: string): Promise<UserContext | null> => {
  const user = await getRepository(User)
    .createQueryBuilder('user')
    .where(`user.apiKeys ? :apiKey`, { apiKey })
    .leftJoinAndSelect('user.roles', 'roles')
    .getOne();

  if (!user) {
    return null;
  }

  return user;
};

export const createGlobalContext = async (ctx: ExpressContext): Promise<GlobalContext> => {
  const { req, res } = ctx;

  const authorization = req.headers.authorization ?? '';
  const refreshTokenCookie = req.cookies.refreshToken ?? '';
  let apiKey = req.headers['x-dockite-token'] ?? '';

  if (authorization) {
    const user = exchangeBearerTokenForUser(authorization);

    if (user) {
      return { req, res, user };
    }
  }

  if (refreshTokenCookie) {
    log('user session expired, issuing new jwt');

    const user = await exchangeRefreshTokenForUser(refreshTokenCookie);

    if (user) {
      const [bearerToken, refreshToken] = await Promise.all([
        Promise.resolve(
          sign({ ...user }, config.app.secret ?? '', {
            expiresIn: '15m',
          }),
        ),
        Promise.resolve(
          sign({ ...user }, config.app.secret ?? '', {
            expiresIn: '3d',
          }),
        ),
      ]);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      });

      res.setHeader('authorization', `Bearer ${bearerToken}`);

      return { req, res, user };
    }
  }

  if (!apiKey) {
    log('api key not found in headers, checking queryparams');

    apiKey = (req.query['x-dockite-token'] ?? '') as string;
  }

  if (apiKey) {
    const user = await exchangeAPIKeyForUser(apiKey as string);

    if (!user) {
      return { req, res, user: undefined };
    }

    return { req, res, user };
  }

  return { req, res, user: undefined };
};
