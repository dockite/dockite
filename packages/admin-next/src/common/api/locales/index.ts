import { noop } from 'lodash';

import { Locale } from '@dockite/database';

import { WORLD_FLAGS } from '~/common/constants';

/**
 *
 */
export const fetchAllLocales = async (): Promise<Locale[]> => {
  return WORLD_FLAGS.map(flag => {
    return {
      id: flag.name,
      title: flag.name,
      icon: flag.name,
    };
  });
};

export const createLocale = noop;

export const updateLocale = noop;

export const deleteLocale = noop;
