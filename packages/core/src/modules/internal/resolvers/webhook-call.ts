import { Arg, Authorized, Mutation, Query, Resolver } from 'type-graphql';
import { getRepository } from 'typeorm';

import { WebhookCall } from '../../../entities';

const repository = getRepository(WebhookCall);

@Resolver(_of => WebhookCall)
export class WebhookCallResolver {
  @Authorized()
  @Query(_returns => WebhookCall, { nullable: true })
  async getWebhookCall(@Arg('id') id: string): Promise<WebhookCall | null> {
    const webhookCall = await repository.findOne({ where: { id } });

    return webhookCall ?? null;
  }

  /**
   * TODO: Move this to and Connection/Edge model
   */
  @Authorized()
  @Query(_returns => [WebhookCall])
  async allWebhookCalls(): Promise<WebhookCall[] | null> {
    const webhookCalls = await repository.find();

    return webhookCalls ?? null;
  }

  @Authorized()
  @Mutation(_returns => Boolean)
  async removeWebhookCall(@Arg('id') id: string): Promise<boolean> {
    try {
      const webhookCall = await repository.findOneOrFail({ where: { id } });

      await repository.remove(webhookCall);

      return true;
    } catch {
      return false;
    }
  }
}
