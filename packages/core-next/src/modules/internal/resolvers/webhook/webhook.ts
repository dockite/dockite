import debug from 'debug';
import { Arg, Args, Mutation, Query, Resolver } from 'type-graphql';
import { getRepository, Repository } from 'typeorm';

import { Webhook } from '@dockite/database';

import { AXIOS_METHODS } from '../../../../common/constants';
import { Authenticated, Authorized } from '../../../../common/decorators';
import { createFindManyResult } from '../document/util';

import {
  AllWebhooksArgs,
  CreateWebhookArgs,
  DeleteWebhookArgs,
  GetWebhookArgs,
  UpdateWebhookArgs,
} from './args';
import { FindManyWebhooksResult } from './types';

const log = debug('dockite:core:resolvers:webhook');

/**
 *
 */
@Resolver(_of => Webhook)
export class WebhookResolver {
  private webhookRepository: Repository<Webhook>;

  constructor() {
    this.webhookRepository = getRepository(Webhook);
  }

  @Authenticated()
  @Authorized({ scope: 'internal:webhook:read' })
  @Query(_returns => Webhook)
  public async getWebhook(
    @Args()
    input: GetWebhookArgs,
  ): Promise<Webhook> {
    const { id } = input;

    try {
      const webhook = await this.webhookRepository.findOneOrFail(id);

      return webhook;
    } catch (err) {
      log(err);

      throw new Error(`Unable to retrieve webhook with ID ${id}`);
    }
  }

  @Authenticated()
  @Authorized({ scope: 'internal:webhook:read' })
  @Query(_returns => FindManyWebhooksResult)
  public async allWebhooks(
    @Args()
    input: AllWebhooksArgs,
  ): Promise<FindManyWebhooksResult> {
    const { page, perPage } = input;

    try {
      const [webhooks, count] = await this.webhookRepository.findAndCount({
        take: perPage,
        skip: (page - 1) * perPage,
        order: { name: 'DESC' },
      });

      return createFindManyResult(webhooks, count, page, perPage);
    } catch (err) {
      log(err);

      throw new Error(`Unable to retrieve webhooks`);
    }
  }

  @Authenticated()
  @Authorized({ scope: 'internal:webhook:create' })
  @Mutation(_returns => Webhook)
  public async createWebhook(
    @Arg('input', _type => CreateWebhookArgs)
    input: CreateWebhookArgs,
  ): Promise<Webhook> {
    const { name, url, method, options } = input;

    try {
      if (!AXIOS_METHODS.includes(method)) {
        throw new Error('Method provided for webhook is invalid');
      }

      if (options.listeners.length === 0) {
        throw new Error('Webhook must listen to at least 1 event');
      }

      const webhook = await this.webhookRepository.save({
        name,
        method,
        url,
        options,
      });

      return webhook;
    } catch (err) {
      log(err);

      throw new Error('Unable to create provided webhook');
    }
  }

  @Authenticated()
  @Authorized({ scope: 'internal:webhook:update' })
  @Mutation(_returns => Webhook)
  public async updateWebhook(
    @Arg('input', _type => UpdateWebhookArgs)
    input: UpdateWebhookArgs,
  ): Promise<Webhook> {
    const { id, name, url, method, options } = input;

    try {
      const webhook = await this.webhookRepository.findOneOrFail(id);

      if (!AXIOS_METHODS.includes(method)) {
        throw new Error('Method provided for webhook is invalid');
      }

      if (options.listeners.length === 0) {
        throw new Error('Webhook must listen to at least 1 event');
      }

      const updatedWebhook = await this.webhookRepository.save({
        ...webhook,
        name,
        method,
        url,
        options,
      });

      return updatedWebhook;
    } catch (err) {
      log(err);

      throw new Error('Unable to create provided webhook');
    }
  }

  @Authenticated()
  @Authorized({ scope: 'internal:webhook:delete' })
  @Mutation(_returns => Boolean)
  public async deleteWebhook(
    @Arg('input', _type => DeleteWebhookArgs)
    input: DeleteWebhookArgs,
  ): Promise<boolean> {
    const { id } = input;
    try {
      const webhook = await this.webhookRepository.findOneOrFail(id);

      await this.webhookRepository.remove(webhook);

      return true;
    } catch (err) {
      log(err);

      return false;
    }
  }
}

export default WebhookResolver;
