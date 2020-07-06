import debug from 'debug';

const log = debug('dockite:external:dummy-auth');
export const authenticated = (..._args: any[]): string => {
  log('warning you are using dummy authentication, this will allow anyone to perform any action');

  return 'Unknown';
};

export const authorized = (..._args: any[]): boolean => {
  log('warning you are using dummy authentication, this will allow anyone to perform any action');

  return true;
};
