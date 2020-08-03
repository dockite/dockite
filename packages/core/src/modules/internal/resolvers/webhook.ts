import { Webhook } from '@dockite/database';
import GraphQLJSON from 'graphql-type-json';
import {
  Arg,
  Field as GraphQLField,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';
import { getRepository } from 'typeorm';

import { Authenticated, Authorized } from '../../../common/decorators';
import { RequestMethods } from '../../../common/types';

@ObjectType()
class ManyWebhooks {
  @GraphQLField(_type => [Webhook])
  results!: Webhook[];

  @GraphQLField(_type => Int)
  totalItems!: number;

  @GraphQLField(_type => Int)
  currentPage!: number;

  @GraphQLField(_type => Int)
  totalPages!: number;

  @GraphQLField(_type => Boolean)
  hasNextPage!: boolean;
}

@Resolver(_of => Webhook)
export class WebhookResolver {
  @Authenticated()
  @Authorized('internal:webhook:read', { derriveAlternativeScopes: false })
  @Query(_returns => Webhook, { nullable: true })
  async getWebhook(@Arg('id') id: string): Promise<Webhook | null> {
    const repository = getRepository(Webhook);

    const webhook = await repository.findOne({ where: { id } });

    return webhook ?? null;
  }

  @Authenticated()
  @Authorized('internal:webhook:read', { derriveAlternativeScopes: false })
  @Query(_returns => ManyWebhooks)
  async allWebhooks(
    @Arg('page', _type => Int, { defaultValue: 1 })
    page: number,
    @Arg('perPage', _type => Int, { defaultValue: 20 })
    perPage: number,
  ): Promise<ManyWebhooks> {
    const repository = getRepository(Webhook);

    const [results, totalItems] = await repository.findAndCount({
      take: perPage,
      skip: perPage * (page - 1),
      order: { createdAt: 'DESC' },
    });

    const totalPages = Math.ceil(totalItems / perPage);

    return {
      results,
      totalItems,
      currentPage: page,
      hasNextPage: page < totalPages,
      totalPages,
    };
  }

  @Authenticated()
  @Authorized('internal:webhook:create', { derriveAlternativeScopes: false })
  @Mutation(_returns => Webhook)
  async createWebhook(
    @Arg('name') name: string,
    @Arg('url') url: string,
    @Arg('method', _type => String) method: string, // eslint-disable-line
    @Arg('options', _type => GraphQLJSON) options: any, // eslint-disable-line
  ): Promise<Webhook | null> {
    const repository = getRepository(Webhook);

    if (!Object.values(RequestMethods).includes(method as RequestMethods)) {
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

  @Authenticated()
  @Authorized('internal:webhook:update', { derriveAlternativeScopes: false })
  @Mutation(_returns => Webhook)
  async updateWebhook(
    @Arg('id')
    id: string,
    @Arg('name')
    name: string,
    @Arg('url')
    url: string,
    @Arg('method', _type => String)
    method: string, // eslint-disable-line
    @Arg('options', _type => GraphQLJSON)
    options: any, // eslint-disable-line
  ): Promise<Webhook | null> {
    const repository = getRepository(Webhook);

    if (!Object.values(RequestMethods).includes(method as RequestMethods)) {
      throw new Error('Method provided is invalid');
    }

    const webhook = await repository.findOneOrFail(id);

    const savedWebhook = await repository.save({
      ...webhook,
      name,
      url,
      method,
      options,
    });

    return savedWebhook;
  }

  @Authenticated()
  @Authorized('internal:webhook:delete', { derriveAlternativeScopes: false })
  @Mutation(_returns => Boolean)
  async removeWebhook(@Arg('id') id: string): Promise<boolean> {
    const repository = getRepository(Webhook);

    try {
      const webhook = await repository.findOneOrFail({ where: { id } });

      await repository.remove(webhook);

      return true;
    } catch {
      return false;
    }
  }
}
