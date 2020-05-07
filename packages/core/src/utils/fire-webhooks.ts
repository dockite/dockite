import { WebhookAction } from '@dockite/types';
import { getRepository, InsertResult } from 'typeorm';
import Axios, { Method, AxiosError, AxiosResponse } from 'axios';
import { graphql } from 'graphql';

import { Webhook, WebhookCall } from '../entities';
import { SchemaStore } from '../server';

const queryString = `
  EXISTS(
    SELECT 1
    FROM jsonb_array_elements_text(webhook.options -> 'actions') as actions
    WHERE actions = :action
  )
  `
  .replace(/\s{2}/g, ' ')
  .replace(/\n/g, '');

export const fireWebhooks = async (entity: object, action: WebhookAction): Promise<void> => {
  const webhookRepository = getRepository(Webhook);
  const webhookCallRepository = getRepository(WebhookCall);

  const qb = webhookRepository.createQueryBuilder('webhook').where(queryString, { action });

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
