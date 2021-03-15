import debug from 'debug';

import { registerField } from '@dockite/manager';
import { DockiteConfiguration, DockiteFieldStatic } from '@dockite/types';

import { FieldRegistrationError } from '../common/errors/fields';
import { importModule, startTiming } from '../common/util';

const log = debug('dockite:core:fields');

/**
 * Determines whether a given module is a valid Dockite Field class based on it containing
 * a static `type` property.
 */
export const isDockiteFieldClass = (entry: any): entry is DockiteFieldStatic => {
  if (typeof entry === 'function' && typeof entry.type === 'string') {
    return true;
  }

  return false;
};

/**
 * Retrieves the modules registered within the `fields` section of the configuration file and then
 * registers any valid field entrypoints found within the modules.
 *
 * @throws {FieldRegistrationError} Throws a field registration error when any field is unable to be registered.
 */
export const registerDockiteFields = async (config: DockiteConfiguration): Promise<void> => {
  const elapsed = startTiming();

  try {
    const modulePromises = config.fields.map(mod => importModule(mod));

    const modules = await Promise.all(modulePromises);

    // For each entrypoint within the module we will test if it's a valid dockite field class
    // and then register it if it is.
    modules.forEach(mod => {
      Object.values(mod).forEach(entry => {
        if (isDockiteFieldClass(entry)) {
          registerField(entry.type, entry);
        }
      });
    });
  } catch (err) {
    log(err);

    throw new FieldRegistrationError(
      'An error occurred while attempting to register the fields provided within the configuration file.',
    );
  } finally {
    log(`fields registered in ${elapsed()} milliseconds`);
  }
};
