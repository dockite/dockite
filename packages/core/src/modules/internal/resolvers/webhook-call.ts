import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import { getRepository } from 'typeorm';

import { Authenticated } from '../../../common/authorizers';
import { WebhookCall } from '../../../entities';

@Resolver(_of => WebhookCall)
export class WebhookCallResolver {
  @Authenticated()
  @Query(_returns => WebhookCall, { nullable: true })
  async getWebhookCall(@Arg('id') id: string): Promise<WebhookCall | null> {
    const repository = getRepository(WebhookCall);

    const webhookCall = await repository.findOne({ where: { id } });

    return webhookCall ?? null;
  }

  /**
   * TODO: Move this to and Connection/Edge model
   */
  @Authenticated()
  @Query(_returns => [WebhookCall])
  async allWebhookCalls(): Promise<WebhookCall[] | null> {
    const repository = getRepository(WebhookCall);

    const webhookCalls = await repository.find();

    return webhookCalls ?? null;
  }

  @Authenticated()
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
