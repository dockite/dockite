import { noop } from 'lodash';

import { Locale } from '@dockite/database';

export const fetchAllLocales = async (): Promise<Locale[]> => {
  return [];
};

export const createLocale = noop;

export const updateLocale = noop;

export const deleteLocale = noop;
