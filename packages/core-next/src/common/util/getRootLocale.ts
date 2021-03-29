import { getConfig } from '../config';

/**
 * Retrieves the root locale from the config file.
 */
export const getRootLocale = (): string => {
  const config = getConfig();

  return config.app.rootLocale?.id ?? 'en-AU';
};

export default getRootLocale;
