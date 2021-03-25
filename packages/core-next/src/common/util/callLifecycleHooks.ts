/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
import { groupBy, sortBy } from 'lodash';

import { Schema, Document } from '@dockite/database';
import { DockiteFieldValidationError, HookContextWithOldData } from '@dockite/types';

import { DocumentValidationError } from '../errors';

export type LifecycleHook =
  | 'processInputRaw'
  | 'onCreate'
  | 'onUpdate'
  | 'onSoftDelete'
  | 'onPermanentDelete'
  | 'validateInputRaw';

export interface CallLifecycleHooksArgs {
  schema: Schema;
  data: Record<string, any>;
  hook: LifecycleHook;
  mutates?: boolean;
  document?: Document;
  oldData?: Record<string, any>;
}

/**
 * Provided an update to a document, call the appropriate lifecycle hooks allowing for mutations.
 *
 * @param schema The Schema entity within the database
 * @param data The document's data
 * @param hook The hook to be called
 * @param mutates Whether the hook will mutate the document's data
 * @param document The document if applicable
 * @param oldData The data prior to the update
 */
export const callLifeCycleHooks = async (payload: CallLifecycleHooksArgs): Promise<void> => {
  const { schema, data, hook, mutates, document, oldData } = payload;

  const validationErrors: Record<string, string> = {};

  // Organise the fields by their priorities so that depedencies can be called correctly
  const priorityGroups = groupBy(schema.fields, field => {
    return field.priority ?? 0;
  });

  // Retrieve the sorted keys for iterating against
  const groupKeys = sortBy(Object.keys(priorityGroups));

  // Then for each priority group
  for (const groupKey of groupKeys) {
    await Promise.all(
      priorityGroups[groupKey].map(async field => {
        if (!field.dockiteField) {
          throw new Error(`dockiteField failed to map for ${field.name} of ${schema.name}`);
        }

        // Skip fields which don't exist (resolves bulk-update issues)
        if (data[field.name] === undefined) {
          return;
        }

        const fieldData = data[field.name] ?? null;

        const hookContext: HookContextWithOldData = {
          field,
          fieldData,
          data,
          oldData,
          document,
          path: field.name,
        };

        try {
          if (mutates) {
            data[field.name] = await field.dockiteField[hook](hookContext);
          } else {
            await field.dockiteField[hook](hookContext);
          }
        } catch (err) {
          if (err instanceof DockiteFieldValidationError) {
            validationErrors[err.path] = err.message;

            if (err.children) {
              err.children.forEach(e => {
                validationErrors[e.path] = e.message;
              });
            }

            throw new DocumentValidationError(validationErrors);
          }
        }
      }),
    );
  }
};
