import debug from 'debug';

import { Webhook } from '@dockite/database';

import { meetsObjectConstraints } from '../common/util';
import { EntityLike } from '../database/types';

const log = debug('dockite:core:webhooks:execution');

/**
 *
 */
export const executeWebhook = async (webhook: Webhook, entity: EntityLike): Promise<void> => {
  if (Array.isArray(webhook.options?.constraints) && webhook.options.constraints.length > 0) {
    if (
      typeof entity === 'object' &&
      !meetsObjectConstraints(entity, webhook.options.constraints)
    ) {
      log(`aborting webhook execution for ${webhook.name} due to not meeting required constraints`);

      Promise.resolve();
    }
  }
};

export const one = 'one';
