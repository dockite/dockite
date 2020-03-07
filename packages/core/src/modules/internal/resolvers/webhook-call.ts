import { Arg, Authorized, Mutation, Query, Resolver } from 'type-graphql';
import { getRepository } from 'typeorm';

import { WebhookCall } from '../../../entities';

@Resolver(_of => WebhookCall)
export class WebhookCallResolver {
  @Authorized()
  @Query(_returns => WebhookCall, { nullable: true })
  async getWebhookCall(@Arg('id') id: string): Promise<WebhookCall | null> {
    const repository = getRepository(WebhookCall);

    const webhookCall = await repository.findOne({ where: { id } });

    return webhookCall ?? null;
  }

  /**
   * TODO: Move this to and Connection/Edge model
   */
  @Authorized()
  @Query(_returns => [WebhookCall])
  async allWebhookCalls(): Promise<WebhookCall[] | null> {
    const repository = getRepository(WebhookCall);

    const webhookCalls = await repository.find();

    return webhookCalls ?? null;
  }

  @Authorized()
  @Mutation(_returns => Boolean)
  async removeWebhookCall(@Arg('id') id: string): Promise<boolean> {
    const repository = getRepository(WebhookCall);

    try {
      const webhookCall = await repository.findOneOrFail({ where: { id } });

      await repository.remove(webhookCall);

      return true;
    } catch {
      return false;
    }
  }
}
