import { getRepository } from 'typeorm';

import { Locale } from '@dockite/database';
import { DockiteConfiguration } from '@dockite/types';

/**
 *
 */
export const createRootLocaleIfNotExists = async (config: DockiteConfiguration): Promise<void> => {
  const localeRepository = getRepository(Locale);

  const count = await localeRepository.count();

  const rootLocale = config.app.rootLocale ?? {};

  if (count === 0) {
    await localeRepository.save({
      id: rootLocale.id ?? 'en-AU',
      title: rootLocale.title ?? 'Australia',
      icon: rootLocale.icon ?? '🇦🇺',
    });
  }
};

export default createRootLocaleIfNotExists;
