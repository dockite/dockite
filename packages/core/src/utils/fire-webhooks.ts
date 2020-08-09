import { Webhook, WebhookCall } from '@dockite/database';
import { SchemaManager } from '@dockite/manager';
import { UserContext, WebhookAction } from '@dockite/types';
import Axios, { AxiosError, AxiosResponse, Method } from 'axios';
import debug from 'debug';
import { graphql } from 'graphql';
import { getRepository, InsertResult } from 'typeorm';

const log = debug('dockite:core:webhooks');

const dockiteFieldReplacer = (key: string, value: any): any => {
  if (key === 'dockiteField') {
    return undefined;
  }

  return value;
};

export const fireWebhooks = async (entity: any, action: WebhookAction): Promise<void> => {
  const webhookRepository = getRepository(Webhook);
  const webhookCallRepository = getRepository(WebhookCall);

  log(`firing webhooks for: ${action}`);

  const qb = webhookRepository
    .createQueryBuilder('webhook')
    .where(`webhook.options -> 'listeners' ? :action`, { action });

  const webhooks = await qb.getMany();

  log(`webhooks to run [${webhooks.map(w => w.name).join(', ')}]`);

  await Promise.all(
    webhooks.map(
      (webhook): Promise<InsertResult | null> => {
        if (!webhook.options.query) {
          return Axios({
            url: webhook.url,
            method: webhook.method as Method,
            data:
              webhook.method.toLowerCase() === 'get'
                ? undefined
                : JSON.stringify(entity, dockiteFieldReplacer),
          }).then(
            (response: AxiosResponse) => {
              return webhookCallRepository.insert({
                executedAt: new Date(),
                request: {
                  url: webhook.url,
                  method: webhook.method,
                  data:
                    webhook.method.toLowerCase() === 'get'
                      ? undefined
                      : JSON.stringify(entity, dockiteFieldReplacer),
                },
                response: { headers: response.headers, data: response.data },
                status: response.status,
                success: true,
                webhookId: webhook.id,
              });
            },
            (error: AxiosError) => {
              if (action !== WebhookAction.WebhookError) {
                fireWebhooks(webhook, WebhookAction.WebhookError);
              }

              return webhookCallRepository.insert({
                executedAt: new Date(),
                request: {
                  url: webhook.url,
                  method: webhook.method,
                  data:
                    webhook.method.toLowerCase() === 'get'
                      ? undefined
                      : JSON.stringify(entity, dockiteFieldReplacer),
                },
                response: {
                  headers: error.response?.headers ?? {},
                  data: error.response?.data ?? '',
                },
                status: error.response?.status ?? 500,
                success: false,
                webhookId: webhook.id,
              });
            },
          );
        }

        if (SchemaManager.internalSchema) {
          log('firing graphql webhooks');
          return graphql(SchemaManager.internalSchema, webhook.options.query, undefined, {
            user: {
              id: '00000000-0000-0000-0000-000000000000',
              email: 'webhooks@dockite',
              createdAt: new Date(1970, 1, 1),
              updatedAt: new Date(1970, 1, 1),
              firstName: 'webhook',
              lastName: 'dockite',
              verified: true,
            } as UserContext,
          }).then(
            result => {
              return Axios({
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
                  if (action !== WebhookAction.WebhookError) {
                    fireWebhooks(webhook, WebhookAction.WebhookError);
                  }

                  return webhookCallRepository.insert({
                    executedAt: new Date(),
                    request: {
                      url: webhook.url,
                      method: webhook.method,
                      data:
                        webhook.method.toLowerCase() === 'get' ? undefined : JSON.stringify(result),
                    },
                    response: {
                      headers: error.response?.headers ?? {},
                      data: error.response?.data ?? '',
                    },
                    status: error.response?.status ?? 500,
                    success: false,
                    webhookId: webhook.id,
                  });
                },
              );
            },
            (err: Error) => {
              log(`errror with ${webhook.name}: ${err}`);
              return Promise.resolve(null);
            },
          );
        }

        return Promise.resolve(null);
      },
    ),
  );
};
