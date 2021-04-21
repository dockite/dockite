import Axios, { AxiosError, Method } from 'axios';
import debug from 'debug';
import { graphql } from 'graphql';
import { getRepository } from 'typeorm';

import { Webhook, WebhookCall } from '@dockite/database';
import { SchemaManager } from '@dockite/manager';

import { meetsObjectConstraints } from '../common/util';
import { getDockiteCircularReplacer } from '../common/util/getDockiteCircularReplacer';
import { getWebhookUserData } from '../modules/authentication/resolvers/authentication/util';

const log = debug('dockite:core:webhooks:execution');

const executeGraphQLWebhook = async (
  webhook: Webhook,
  entity: Record<string, any>,
): Promise<void> => {
  if (!SchemaManager.internal) {
    throw new Error('GraphQL Schema not available');
  }

  const webhookMethod = webhook.method.toUpperCase();

  const webhookCallRepository = getRepository(WebhookCall);

  const result = await graphql({
    schema: SchemaManager.internal,
    source: webhook.options.query as string,
    contextValue: getWebhookUserData(),
    variableValues: typeof entity === 'object' ? entity : undefined,
  });

  if (!result || !result.data) {
    throw new Error(`Failed to execute GraphQL query for ${webhook.name}`);
  }

  const [value] = Object.values(result.data);

  let response = await Axios({
    url: webhook.url,
    method: webhook.method as Method,
    data: webhookMethod !== 'GET' ? value : undefined,
  }).catch((err: AxiosError) => err);

  if (response instanceof Error) {
    if (!response.response) {
      throw new Error('Unable to recover from HTTP error, not inserting webhook call');
    }

    response = response.response;
  }

  await webhookCallRepository.insert(
    webhookCallRepository.create({
      webhookId: webhook.id,
      status: response.status,
      success: response.status >= 200 && response.status <= 299,
      executedAt: new Date(),
      request: {
        url: webhook.url,
        method: webhook.method,
        data: JSON.stringify(value, getDockiteCircularReplacer()),
      },
      response: {
        headers: response.headers,
        data:
          typeof response.data === 'object'
            ? JSON.stringify(response.data, getDockiteCircularReplacer())
            : response.data,
      },
    }),
  );
};

const executeHttpWebhook = async (webhook: Webhook, entity: Record<string, any>): Promise<void> => {
  const webhookMethod = webhook.method.toUpperCase();

  const webhookCallRepository = getRepository(WebhookCall);

  const entityJson = JSON.stringify(entity, getDockiteCircularReplacer(), 2);

  let response = await Axios({
    url: webhook.url,
    method: webhook.method as Method,
    headers: {
      'content-type': 'application/json',
    },
    data: webhookMethod !== 'GET' ? entityJson : undefined,
  }).catch((err: AxiosError) => err);

  if (response instanceof Error) {
    console.log(response);
    if (!response.response) {
      throw new Error('Unable to recover from HTTP error, not inserting webhook call');
    }

    response = response.response;
  }

  await webhookCallRepository.insert(
    webhookCallRepository.create({
      webhookId: webhook.id,
      status: response.status,
      success: response.status >= 200 && response.status <= 299,
      executedAt: new Date(),
      request: {
        url: webhook.url,
        method: webhook.method,
        data: webhookMethod !== 'GET' ? entityJson : undefined,
      },
      response: {
        headers: response.headers,
        data:
          typeof response.data === 'object'
            ? JSON.stringify(response.data, getDockiteCircularReplacer())
            : response.data,
      },
    }),
  );
};

/**
 *
 */
export const executeWebhook = (webhook: Webhook, entity: Record<string, any>): Promise<void> => {
  if (Array.isArray(webhook.options?.constraints) && webhook.options.constraints.length > 0) {
    // Ensure that the entity meets any provided webhook constraints before continuing
    if (
      typeof entity === 'object' &&
      !meetsObjectConstraints(entity, webhook.options.constraints)
    ) {
      log(`aborting webhook execution for ${webhook.name} due to not meeting required constraints`);

      return Promise.resolve();
    }
  }

  if (webhook.options.query && webhook.method.toUpperCase() !== 'GET') {
    return executeGraphQLWebhook(webhook, entity);
  }

  return executeHttpWebhook(webhook, entity);
};

export default executeWebhook;
