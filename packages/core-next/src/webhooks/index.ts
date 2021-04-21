import debug from 'debug';
import { getRepository } from 'typeorm';

import { Webhook } from '@dockite/database';
import { WebhookAction } from '@dockite/types';

import { executeWebhook } from './util';

const log = debug('dockite:core:webhooks');

/**
 *
 */
export const fireWebhooks = async (
  entity: Record<string, any>,
  action: WebhookAction | string,
): Promise<void> => {
  const webhookRepository = getRepository(Webhook);

  // const webhookCallRepository = getRepository(WebhookCall);

  const webhooks = await webhookRepository
    .createQueryBuilder('webhook')
    .where(`webhook.options -> 'listeners' ? :action`, { action })
    .getMany();

  log(`now executing ${webhooks.length} webhooks for ${action}`);

  await Promise.all(
    webhooks.map(webhook =>
      executeWebhook(webhook, entity)
        .catch(() => {
          if (action !== WebhookAction.WebhookError) {
            return fireWebhooks(entity, WebhookAction.WebhookError);
          }

          return Promise.resolve();
        })
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .catch(err => log(err)),
    ),
  );
};

export default fireWebhooks;
