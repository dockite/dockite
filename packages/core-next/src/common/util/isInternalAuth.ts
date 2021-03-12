import { InternalAuthConfiguration, Auth0AuthConfiguration } from '@dockite/types';

/**
 * Determines whether the application is currently running with internal authentication.
 */
export const isInternalAuth = (
  authConfig: InternalAuthConfiguration | Auth0AuthConfiguration,
): authConfig is InternalAuthConfiguration => {
  if ('secret' in authConfig) {
    return true;
  }

  return false;
};

export default isInternalAuth;
