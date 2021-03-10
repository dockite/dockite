import { DockiteConfiguration } from '@dockite/types';

import { importModule } from '../common/util';

import { EntityLike } from './types';

/**
 * Imports the registered external entities from the Dockite configuration file for usage with Typeorm.
 */
export const loadExternalEntities = async (
  config: DockiteConfiguration,
): Promise<Array<EntityLike>> => {
  const entities = config.entities ?? [];

  const resolved = await Promise.all(entities.map(e => importModule<EntityLike>(e)));

  return resolved;
};

export default loadExternalEntities;
