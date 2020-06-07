import { WebhookAction, UserContext } from '@dockite/types';
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

  log(`webhooks to run [${webhooks.map(w => w.name).join(', ')}]`);

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

        if (SchemaStore.internalSchema) {
          log('firing graphql webhooks');
          log(webhook.options.query);
          return graphql(SchemaStore.internalSchema, webhook.options.query, undefined, {
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
              log(result);

              return Axios({
                url: webhook.url,
                method: webhook.method as Method,
                data: webhook.method.toLowerCase() === 'get' ? undefined : JSON.stringify(result),
              }).then(
                (response: AxiosResponse) => {
                  log(response);
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
                  log(error);
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
