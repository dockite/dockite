import { Arg, Authorized, Mutation, Query, Resolver } from 'type-graphql';
import { getRepository } from 'typeorm';

import { Webhook } from '../../../entities';
import { RequestMethods } from '../../../common/types';

const repository = getRepository(Webhook);

@Resolver(_of => Webhook)
export class WebhookResolver {
  @Authorized()
  @Query(_returns => Webhook, { nullable: true })
  async getWebhook(@Arg('id') id: string): Promise<Webhook | null> {
    const webhook = await repository.findOne({ where: { id } });

    return webhook ?? null;
  }

  /**
   * TODO: Move this to and Connection/Edge model
   */
  @Authorized()
  @Query(_returns => [Webhook])
  async allWebhooks(): Promise<Webhook[] | null> {
    const webhooks = await repository.find();

    return webhooks ?? null;
  }

  @Authorized()
  @Mutation(_returns => Webhook)
  async createWebhook(
    @Arg('name') name: string,
    @Arg('url') url: string,
    @Arg('method') method: RequestMethods, // eslint-disable-line
    @Arg('options') options: any, // eslint-disable-line
  ): Promise<Webhook | null> {
    if (!Object.values(RequestMethods).includes(method)) {
      throw new Error('Method provided is invalid');
    }

    const webhook = repository.create({
      name,
      url,
      method,
      options,
    });

    const savedWebhook = await repository.save(webhook);

    return savedWebhook;
  }

  @Authorized()
  @Mutation(_returns => Boolean)
  async removeWebhook(@Arg('id') id: string): Promise<boolean> {
    try {
      const webhook = await repository.findOneOrFail({ where: { id } });

      await repository.remove(webhook);

      return true;
    } catch {
      return false;
    }
  }
}
