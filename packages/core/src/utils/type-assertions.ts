import { InternalAuthConfiguration, Auth0AuthConfiguration } from '@dockite/types';

export const isInternalAuth = (
  authConfig: InternalAuthConfiguration | Auth0AuthConfiguration,
): authConfig is InternalAuthConfiguration => {
  if ('secret' in authConfig) {
    return true;
  }

  return false;
};
