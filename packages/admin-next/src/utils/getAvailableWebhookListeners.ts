import { Schema, Singleton } from '@dockite/database';

import { DEFAULT_LISTENERS } from '~/common/constants';

/**
 *
 */
export const getAvailableWebhookListeners = (
  schemas: Schema[],
  singletons: Singleton[],
): string[] => {
  const listeners: string[] = [...DEFAULT_LISTENERS];

  (schemas || []).forEach(schema => {
    const name = schema.name.toLowerCase();

    listeners.push(
      `schema:${name}:update`,
      `schema:${name}:delete`,
      `document:${name}:edit`,
      `document:${name}:update`,
      `document:${name}:delete`,
    );
  });

  (singletons || []).forEach(singleton => {
    const name = singleton.name.toLowerCase();

    listeners.push(
      `schema:${name}:update`,
      `schema:${name}:delete`,
      `document:${name}:edit`,
      `document:${name}:update`,
      `document:${name}:delete`,
    );
  });

  return listeners;
};

export default getAvailableWebhookListeners;
