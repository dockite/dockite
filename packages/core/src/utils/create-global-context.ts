import crypto from 'crypto';

import { User } from '@dockite/database';
import { GlobalContext, UserContext } from '@dockite/types';
import {
  Auth0AuthConfiguration,
  InternalAuthConfiguration,
} from '@dockite/types/lib/common/config/auth';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { hashSync } from 'bcrypt';
import debug from 'debug';
import { GraphQLSchema } from 'graphql';
import { sign, verify as jwtVerify } from 'jsonwebtoken';
import JwksClient from 'jwks-rsa';
import { getRepository } from 'typeorm';

import { getConfig } from '../config';

import { verify } from './jwt-verify';
import { isInternalAuth } from './type-assertions';

const log = debug('dockite:context:builder');

const config = getConfig();

const exchangeBearerTokenForUser = async (bearerToken: string): Promise<UserContext | null> => {
  const bearerSplit = bearerToken.split('Bearer');
  const token = bearerSplit[bearerSplit.length - 1].trim();

  const authConfig = config.auth as InternalAuthConfiguration;

  try {
    const user = verify<UserContext>(token, authConfig.secret ?? '');

    return user;
  } catch (err) {
    return null;
  }
};

const exchangeAuth0TokenForUser = async (bearerToken: string): Promise<UserContext | null> => {
  const authConfig = config.auth as Auth0AuthConfiguration;

  const client = JwksClient({
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`,
  });

  const result = await new Promise<Record<string, any>>((resolve, reject) => {
    jwtVerify(
      bearerToken,
      (header, cb) => {
        if (!header.kid) {
          reject(new Error('No "kid" attribute in header'));
        }

        client.getSigningKey(header.kid as string, (err, key) => {
          if (err) {
            reject(err);
          }

          cb(null, key.getPublicKey());
        });
      },
      {
        audience: authConfig.audience,
        algorithms: ['RS256'],
        issuer: `https://${authConfig.domain}/`,
      },
      (err, verifyResult) => {
        if (err) {
          reject(err);
        }

        resolve(verifyResult as Record<string, any>);
      },
    );
  });

  const userRepository = getRepository(User);

  const auth0Id = result.sub.split('|').pop();

  const email = `${auth0Id}@auth0.com`;

  const password = crypto
    .randomBytes(40)
    .toString('base64')
    .slice(0, 30);

  const user = await userRepository
    .findOneOrFail({
      where: { email },
    })
    .catch(() => {
      const [firstName, lastName] = result.name.split(' ');
      return userRepository.save(
        userRepository.create({
          email,
          firstName: firstName || '',
          lastName: lastName || '',
          password: hashSync(password, 10),
          verified: true,
        }),
      );
    });

  return user;
};

const exchangeRefreshTokenForUser = async (refreshToken: string): Promise<UserContext | null> => {
  try {
    const authConfig = config.auth as InternalAuthConfiguration;

    const refresh = verify<UserContext>(refreshToken, authConfig.secret ?? '');

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

export const createGlobalContext = async (
  ctx: ExpressContext,
  schema: GraphQLSchema,
): Promise<GlobalContext> => {
  const { req, res } = ctx;

  const authorization = req.headers.authorization ?? '';
  const refreshTokenCookie = req.cookies.refreshToken ?? '';
  let apiKey = req.headers['x-dockite-token'] ?? '';

  if (authorization) {
    let user: UserContext | null;

    if (isInternalAuth(config.auth)) {
      user = await exchangeBearerTokenForUser(authorization);
    } else {
      user = await exchangeAuth0TokenForUser(authorization);
    }

    if (user) {
      return { req, res, user, schema };
    }
  }

  if (isInternalAuth(config.auth) && refreshTokenCookie) {
    log('user session expired, issuing new jwt');

    const user = await exchangeRefreshTokenForUser(refreshTokenCookie);

    if (user) {
      const tokenPayload = {
        id: user.id,
        firstname: user.firstName,
        lastName: user.lastName,
        email: user.email,
        verified: user.verified,
        normalizedScopes: user.normalizedScopes,
      };

      const [bearerToken, refreshToken] = await Promise.all([
        Promise.resolve(
          sign(tokenPayload, config.auth.secret ?? '', {
            expiresIn: '15m',
          }),
        ),
        Promise.resolve(
          sign(tokenPayload, config.auth.secret ?? '', {
            expiresIn: '3d',
          }),
        ),
      ]);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      });

      res.setHeader('authorization', `Bearer ${bearerToken}`);

      return { req, res, user, schema };
    }
  }

  if (!apiKey) {
    apiKey = (req.query['x-dockite-token'] ?? '') as string;
  }

  if (apiKey) {
    const user = await exchangeAPIKeyForUser(apiKey as string);

    if (user) {
      return { req, res, user, schema };
    }
  }

  return { req, res, user: undefined, schema };
};
