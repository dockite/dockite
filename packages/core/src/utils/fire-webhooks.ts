import { WebhookAction } from '@dockite/types';
import { getRepository, InsertResult } from 'typeorm';
import Axios, { Method, AxiosError, AxiosResponse } from 'axios';
import { graphql } from 'graphql';
import debug from 'debug';

import { Webhook, WebhookCall } from '../entities';
import { SchemaStore } from '../server';

const log = debug('dockite:core:webhooks');

export const fireWebhooks = async (entity: object, action: WebhookAction): Promise<void> => {
  const webhookRepository = getRepository(Webhook);
  const webhookCallRepository = getRepository(WebhookCall);

  log(`firing webhooks for: ${action}`);

  const qb = webhookRepository
    .createQueryBuilder('webhook')
    .where(`webhook.options -> 'listeners' ? :action`, { action });

  const webhooks = await qb.getMany();

  await Promise.all(
    webhooks.map(
      (webhook): Promise<InsertResult | null> => {
        if (!webhook.options.query) {
          return Axios({
            url: webhook.url,
            method: webhook.method as Method,
            data: webhook.method.toLowerCase() === 'get' ? undefined : JSON.stringify(entity),
          }).then(
            (response: AxiosResponse) => {
              return webhookCallRepository.insert({
                executedAt: new Date(),
                request: {
                  url: webhook.url,
                  method: webhook.method,
                  data: webhook.method.toLowerCase() === 'get' ? undefined : JSON.stringify(entity),
                },
                response: { headers: response.headers, data: response.data },
                status: response.status,
                success: true,
                webhookId: webhook.id,
              });
            },
            (error: AxiosError) => {
              return webhookCallRepository.insert({
                executedAt: new Date(),
                request: {
                  url: webhook.url,
                  method: webhook.method,
                  data: webhook.method.toLowerCase() === 'get' ? undefined : JSON.stringify(entity),
                },
                status: error.response?.status ?? 500,
                success: false,
                webhookId: webhook.id,
              });
            },
          );
        }

        if (SchemaStore.schema) {
          return graphql(SchemaStore.schema, webhook.options.query)
            .then(result =>
              Axios({
                url: webhook.url,
                method: webhook.method as Method,
                data: webhook.method.toLowerCase() === 'get' ? undefined : JSON.stringify(result),
              }).then(
                (response: AxiosResponse) => {
                  return webhookCallRepository.insert({
                    executedAt: new Date(),
                    request: {
                      url: webhook.url,
                      method: webhook.method,
                      data:
                        webhook.method.toLowerCase() === 'get' ? undefined : JSON.stringify(result),
                    },
                    response: { headers: response.headers, data: response.data },
                    status: response.status,
                    success: true,
                    webhookId: webhook.id,
                  });
                },
                (error: AxiosError) => {
                  return webhookCallRepository.insert({
                    executedAt: new Date(),
                    request: {
                      url: webhook.url,
                      method: webhook.method,
                      data:
                        webhook.method.toLowerCase() === 'get' ? undefined : JSON.stringify(result),
                    },
                    status: error.response?.status ?? 500,
                    success: false,
                    webhookId: webhook.id,
                  });
                },
              ),
            )
            .catch(() => Promise.resolve(null));
        }

        return Promise.resolve(null);
      },
    ),
  );
};
