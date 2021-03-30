import { Locale } from '@dockite/database';

import { useConfig } from '~/hooks/useConfig';

/**
 * Determines whether the provided Locale is the root locale by comparing locale id's.
 */
export const isRootLocale = (locale: Locale | string): boolean => {
  const config = useConfig();

  const rootLocaleId = config.app.rootLocale?.id ?? 'en-AU';

  if (typeof locale === 'string') {
    return locale === rootLocaleId;
  }

  return locale.id === rootLocaleId;
};

export default isRootLocale;
