import { Arg, Mutation, Query, Resolver, Ctx } from 'type-graphql';
import { getRepository } from 'typeorm';

import { Authenticated } from '../../../common/authorizers';
import { GlobalContext } from '../../../common/types';
import { Document, Release } from '../../../entities';

@Resolver(_of => Release)
export class ReleaseResolver {
  @Authenticated()
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
  @Query(_returns => [Release])
  async allReleases(): Promise<Release[] | null> {
    const repository = getRepository(Release);

    const releases = await repository.find();

    return releases ?? null;
  }

  @Authenticated()
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
