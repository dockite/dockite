import { verify } from 'jsonwebtoken';
import { getRepository } from 'typeorm';

import { User } from '@dockite/database';
import { DockiteConfiguration, InternalAuthConfiguration } from '@dockite/types';

/**
 * Provided an API Key, find a user with that API Key or return null to indicate no match.
 */
export const exchangeApiKeyForUser = async (apiKey: string): Promise<User | null> => {
  const userRespository = getRepository(User);

  // Get the user where the provided api key can be found in the apiKeys column
  const user = await userRespository
    .createQueryBuilder('user')
    .where('user.apiKeys ? :apiKey', { apiKey })
    .leftJoinAndSelect('user.roles', 'roles')
    .getOne();

  if (!user) {
    return null;
  }

  return user;
};

/**
 * Provided a refresh token, attempt to decode the token and retrieve the user returning null on no match.
 */
export const exchangeRefreshTokenForUser = async (
  token: string,
  config: DockiteConfiguration,
): Promise<User | null> => {
  const authConfig = config.auth as InternalAuthConfiguration;

  const userRespository = getRepository(User);

  const payload = verify(token, authConfig.secret ?? '') as User;

  if (!payload.id) {
    return null;
  }

  const user = await userRespository.findOne({
    where: {
      id: payload.id,
    },
  });

  if (!user) {
    return null;
  }

  return user;
};

/**
 * Provided a bearer token, attempt to decode the token and retrieve the user returning null on no match.
 */
export const exchangeBearerTokenForUser = (
  token: string,
  config: DockiteConfiguration,
): User | null => {
  const authConfig = config.auth as InternalAuthConfiguration;

  const trimmedToken = (token.split('Bearer').pop() ?? '').trim();

  if (!trimmedToken) {
    return null;
  }

  const user = verify(trimmedToken, authConfig.secret ?? '') as User;

  return user ?? null;
};
