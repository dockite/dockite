import debug from 'debug';
import { Args, Query, Resolver } from 'type-graphql';
import { getRepository, Repository } from 'typeorm';

import { Webhook, WebhookCall } from '@dockite/database';

import { Authenticated, Authorized } from '../../../../common/decorators';
import { createFindManyResult } from '../document/util';

import { AllWebhookCallArgs, GetWebhookCallArgs } from './args';
import { FindManyWebhookCallsResult } from './types';

const log = debug('dockite:core:resolvers:webhookcall');

/**
 *
 */
@Resolver(_of => WebhookCall)
export class WebhookCallResolver {
  private webhookRepository: Repository<Webhook>;

  private webhookCallRepository: Repository<WebhookCall>;

  constructor() {
    this.webhookRepository = getRepository(Webhook);

    this.webhookCallRepository = getRepository(WebhookCall);
  }

  @Authenticated()
  @Authorized({ scope: 'internal:webhook:read' })
  @Query(_returns => WebhookCall)
  public async getWebhookCall(
    @Args()
    input: GetWebhookCallArgs,
  ): Promise<WebhookCall> {
    const { id } = input;

    try {
      const webhookCall = await this.webhookCallRepository.findOneOrFail(id);

      return webhookCall;
    } catch (err) {
      log(err);

      throw new Error(`Unable to retrieve Webhook Call with ID ${id}`);
    }
  }

  @Authenticated()
  @Authorized({ scope: 'internal:webhook:read' })
  @Query(_returns => FindManyWebhookCallsResult)
  public async allWebhookCalls(
    @Args()
    input: AllWebhookCallArgs,
  ): Promise<FindManyWebhookCallsResult> {
    const { webhookId, page, perPage } = input;

    try {
      const [webhookCalls, count] = await this.webhookCallRepository.findAndCount({
        where: {
          webhookId,
        },
        order: {
          executedAt: 'DESC',
        },
        take: perPage,
        skip: (page - 1) * perPage,
      });

      return createFindManyResult(webhookCalls, count, page, perPage);
    } catch (err) {
      log(err);

      throw new Error(`Unable to retrieve Webhook Calls for Webhook with ID ${webhookId}`);
    }
  }

  // TODO: Add replay resolver
}

export default WebhookCallResolver;
