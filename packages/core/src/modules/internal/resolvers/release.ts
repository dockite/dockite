import { Document, Release } from '@dockite/database';
import {
  Arg,
  Ctx,
  Field as GraphQLField,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';
import { getRepository } from 'typeorm';

import { Authenticated, Authorized } from '../../../common/decorators';
import { GlobalContext } from '../../../common/types';

@ObjectType()
class ManyReleases {
  @GraphQLField(_type => [Release])
  results!: Release[];

  @GraphQLField(_type => Int)
  totalItems!: number;

  @GraphQLField(_type => Int)
  currentPage!: number;

  @GraphQLField(_type => Int)
  totalPages!: number;

  @GraphQLField(_type => Boolean)
  hasNextPage!: boolean;
}

@Resolver(_of => Release)
export class ReleaseResolver {
  @Authenticated()
  @Authorized('internal:release:read', { derriveAlternativeScopes: false })
  @Query(_returns => Release, { nullable: true })
  async getRelease(@Arg('id') id: string): Promise<Release | null> {
    const repository = getRepository(Release);

    const release = await repository.findOne({ where: { id } });

    return release ?? null;
  }

  /**
   * TODO: Move this to and Connection/Edge model
   */
  @Authenticated()
  @Authorized('internal:release:read', { derriveAlternativeScopes: false })
  @Query(_returns => ManyReleases)
  async allReleases(
    @Arg('page', _type => Int, { defaultValue: 1 })
    page: number,
    @Arg('perPage', _type => Int, { defaultValue: 20 })
    perPage: number,
  ): Promise<ManyReleases> {
    const repository = getRepository(Release);

    const [results, totalItems] = await repository.findAndCount({
      take: perPage,
      skip: perPage * (page - 1),
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
  @Authorized('internal:release:create', { derriveAlternativeScopes: false })
  @Mutation(_returns => Release)
  async createRelease(
    @Arg('name') name: string,
    @Arg('description') description: string,
    @Arg('scheduledFor', _type => Date, { nullable: true, defaultValue: null })
    scheduledFor: Date | null = null,
    @Ctx() ctx: GlobalContext,
  ): Promise<Release | null> {
    const repository = getRepository(Release);

    const { id: userId } = ctx.user!; // eslint-disable-line

    const release = repository.create({
      name,
      description,
      scheduledFor,
      userId,
    });

    const savedRelease = await repository.save(release);

    return savedRelease;
  }

  @Authenticated()
  @Authorized('internal:release:publish', { derriveAlternativeScopes: false })
  @Mutation(_returns => Boolean)
  async publishRelease(@Arg('id') id: string, @Ctx() ctx: GlobalContext): Promise<boolean> {
    const repository = getRepository(Release);

    try {
      const { id: userId } = ctx.user!; // eslint-disable-line
      const release = await repository.findOneOrFail({ where: { id } });

      await getRepository(Document).update(
        {
          releaseId: release.id,
        },
        {
          releaseId: null,
          publishedAt: new Date(),
        },
      );

      release.publishedBy = userId;

      await repository.save(release);

      return true;
    } catch {
      return false;
    }
  }

  @Authenticated()
  @Authorized('internal:release:delete', { derriveAlternativeScopes: false })
  @Mutation(_returns => Boolean)
  async removeRelease(@Arg('id') id: string): Promise<boolean> {
    const repository = getRepository(Release);

    try {
      const release = await repository.findOneOrFail({ where: { id } });

      await repository.remove(release);

      return true;
    } catch {
      return false;
    }
  }
}
