import express from 'express';
import { sign } from 'jsonwebtoken';

import { User } from '@dockite/database';

import { getConfig } from '../config';

import { isInternalAuth } from './isInternalAuth';

export type JwtTokenForUserPayload = Pick<
  User,
  'id' | 'firstName' | 'lastName' | 'email' | 'verified' | 'normalizedScopes'
>;

/**
 * Handles the creation of a JWT token for a given user, includes setting headers and cookies provided an instance
 * of the current ExpressJS response.
 */
export const createJwtTokenForUser = (
  payload: JwtTokenForUserPayload,
  response?: express.Response,
): string => {
  const config = getConfig();

  // If we're not dealing with internal authentication we should throw early to avoid further errors.
  if (!isInternalAuth(config.auth)) {
    throw new Error('Unable to create JWT for non-internal authentication methods.');
  }

  // Create the bearer and refresh token even if we don't have the express response context.
  const [bearer, refresh] = [
    sign(payload, config.auth.secret ?? '', { expiresIn: '15m' }),
    sign(payload, config.auth.secret ?? '', { expiresIn: '3d' }),
  ];

  // If we do have the express response context we can set the appropriate headers and cookies.
  if (response) {
    const threeDaysFromNow = Date.now() + 1000 * 60 * 60 * 24 * 3;

    response.setHeader('authorization', `Bearer ${bearer}`);

    response.cookie('refreshToken', refresh, {
      httpOnly: true,
      expires: new Date(threeDaysFromNow),
    });
  }

  // Finally returning the bearer token for further usage.
  return bearer;
};
