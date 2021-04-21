import debug from 'debug';
import { getRepository } from 'typeorm';

import { Webhook } from '@dockite/database';
import { WebhookAction } from '@dockite/types';

import { EntityLike } from '../database/types';

import { executeWebhook } from './util';

const log = debug('dockite:core:webhooks');

/**
 *
 */
export const fireWebhooks = async (
  entity: EntityLike,
  action: WebhookAction | string,
): Promise<void> => {
  const webhookRepository = getRepository(Webhook);

  // const webhookCallRepository = getRepository(WebhookCall);

  const webhooks = await webhookRepository
    .createQueryBuilder('webhook')
    .where(`webhook.options -> 'listeners' ? :action`, { action })
    .getMany();

  log(`now executing ${webhooks.length} webhooks for ${action}`);

  await Promise.all(webhooks.map(webhook => executeWebhook(webhook, entity)));
};

export default fireWebhooks;
