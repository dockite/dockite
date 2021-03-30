import { Locale } from '@dockite/database';

import { useConfig } from '~/hooks/useConfig';

/**
 *
 */
export const getRootLocale = (): Locale => {
  const config = useConfig();

  return {
    id: config.app.rootLocale?.id ?? 'en-AU',
    title: config.app.rootLocale?.title ?? 'Australia',
    icon: config.app.rootLocale?.icon ?? '🇦🇺',
  };
};

export default getRootLocale;
