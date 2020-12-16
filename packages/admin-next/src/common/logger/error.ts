import { captureException } from '@sentry/browser';

import { useConfig } from '~/hooks/useConfig';

export const logE = (e: Error): void => {
  const config = useConfig();

  // If we're in development mode lets log it to the console
  if (DOCKITE_APP_ENV === 'development') {
    console.error(e);
  }

  // Otherwise if sentry config exists we can log it to our sentry provider
  if (DOCKITE_APP_ENV !== 'development' && config.custom?.sentry) {
    captureException(e);
  }
};

export default logE;
