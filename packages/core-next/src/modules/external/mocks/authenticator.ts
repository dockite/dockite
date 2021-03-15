import debug from 'debug';

const log = debug('dockite:external:mocks:authenticator');

/**
 * Provides a mocked authenticated response allowing any action to be performed.
 *
 * It is highly suggested that the user bring their own authenticator to avoid this behaviour.
 */
export const authenticated = (..._args: any[]): string => {
  log('warning you are using mocked authentication, this will allow anyone to perform any action');

  return 'Unknown';
};

/**
 * Provides a mocked authorization response allowing any actiont o be performed.
 *
 * It is highly suggested that the user bring their own authenticator to avoid this behaviour.
 */
export const authorized = (..._args: any[]): boolean => {
  log('warning you are using mocked authentication, this will allow anyone to perform any action');

  return true;
};
