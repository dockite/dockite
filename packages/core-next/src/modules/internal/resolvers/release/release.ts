import debug from 'debug';
import { Arg, Args, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from 'type-graphql';
import { getRepository, Repository } from 'typeorm';

import { Document, Release } from '@dockite/database';
import { GlobalContext } from '@dockite/types';

import { Authenticated, Authorized } from '../../../../common/decorators';
import { GraphQLPaginationArgs } from '../../../../common/types';
import { createFindManyResult } from '../document/util';

import {
  AllReleasesArgs,
  CreateReleaseArgs,
  DeleteReleaseArgs,
  GetReleaseArgs,
  PublishReleaseArgs,
  UpdateReleaseArgs,
} from './args';
import { FindManyReleasesResult } from './types';

const log = debug('dockite:core:resolvers:release');

/**
 *
 */
@Resolver(_of => Release)
export class ReleaseResolver {
  private releaseRepository: Repository<Release>;

  private documentRepository: Repository<Document>;

  // private draftRepository: Repository<Draft>;

  constructor() {
    this.releaseRepository = getRepository(Release);

    this.documentRepository = getRepository(Document);

    // this.draftRepository =  getRepository(Draft);
  }

  @Authenticated()
  @Authorized({ scope: 'internal:release:read' })
  @Query(_returns => Release)
  public async getRelease(
    @Args()
    input: GetReleaseArgs,
  ): Promise<Release> {
    const { id } = input;

    try {
      const release = await this.releaseRepository.findOneOrFail(id);

      return release;
    } catch (err) {
      log(err);

      throw new Error(`Unable to retrieve Release with ID ${id}`);
    }
  }

  @Authenticated()
  @Authorized({ scope: 'internal:release:read' })
  @Query(_returns => FindManyReleasesResult)
  public async allReleases(
    @Args()
    input: AllReleasesArgs,
  ): Promise<FindManyReleasesResult> {
    const { page, perPage } = input;

    try {
      const [releases, count] = await this.releaseRepository.findAndCount({
        take: perPage,
        skip: (page - 1) * perPage,
      });

      return createFindManyResult(releases, count, page, perPage);
    } catch (err) {
      log(err);

      throw new Error(`Unable to retrieve Releases`);
    }
  }

  @Authenticated()
  @Authorized({ scope: 'internal:release:create' })
  @Mutation(_returns => Release)
  public async createRelease(
    @Arg('input', _type => CreateReleaseArgs)
    input: CreateReleaseArgs,
    @Ctx()
    ctx: GlobalContext,
  ): Promise<Release> {
    const { name, description, scheduledFor } = input;

    try {
      const release = await this.releaseRepository.save({
        name,
        description,
        scheduledFor,
        userId: ctx.user?.id,
      });

      return release;
    } catch (err) {
      log(err);

      throw new Error('Unable to create release with provided input');
    }
  }

  @Authenticated()
  @Authorized({ scope: 'internal:release:update' })
  @Mutation(_returns => Release)
  public async updateRelease(
    @Arg('input', _type => UpdateReleaseArgs)
    input: UpdateReleaseArgs,
    @Ctx()
    ctx: GlobalContext,
  ): Promise<Release> {
    const { id, name, description, scheduledFor } = input;

    try {
      const release = await this.releaseRepository.findOneOrFail(id);

      const updatedRelease = await this.releaseRepository.save({
        ...release,
        name,
        description,
        scheduledFor,
        userId: ctx.user?.id,
      });

      return updatedRelease;
    } catch (err) {
      log(err);

      throw new Error(`Unable to update release with ID ${id}`);
    }
  }

  @Authenticated()
  @Authorized({ scope: 'internal:release:delete' })
  @Mutation(_returns => Boolean)
  public async deleteRelease(
    @Arg('input', _type => DeleteReleaseArgs)
    input: DeleteReleaseArgs,
  ): Promise<boolean> {
    const { id } = input;

    try {
      const release = await this.releaseRepository.findOneOrFail(id);

      await this.releaseRepository.remove(release);

      return true;
    } catch (err) {
      log(err);

      return false;
    }
  }

  @Authenticated()
  @Authorized({ scope: 'internal:release:update', alternativeScopes: ['internal:document:update'] })
  @Mutation(_returns => Boolean)
  public async publishRelease(
    @Arg('input', _type => PublishReleaseArgs)
    input: PublishReleaseArgs,
    @Ctx()
    ctx: GlobalContext,
  ): Promise<boolean> {
    const { id } = input;

    try {
      const release = await this.releaseRepository.findOneOrFail(id);

      release.publishedBy = ctx.user?.id;

      await Promise.all([
        this.releaseRepository.save(release),
        this.documentRepository
          .createQueryBuilder('document')
          .update()
          .where('document.releaseId = :releaseId', { releaseId: release.id })
          .set({
            publishedAt: new Date(),
            updatedAt: new Date(),
            userId: ctx.user?.id,
            releaseId: null,
          })
          .execute(),
      ]);

      return true;
    } catch (err) {
      log(err);

      return false;
    }
  }

  @FieldResolver(_type => [Document])
  public documents(
    @Root()
    release: Release,
    @Args()
    input: GraphQLPaginationArgs,
  ): Promise<Document[]> {
    const { page, perPage } = input;

    return this.documentRepository
      .createQueryBuilder('document')
      .where('document.releaseId = :releaseId', { releaseId: release.id })
      .take(perPage)
      .skip((page - 1) * perPage)
      .getMany();
  }

  // @FieldResolver(_type => [Draft])
  // public drafts(
  //   @Root()
  //   release: Release,
  //   @Args()
  //   input: GraphQLPaginationArgs,
  // ): Promise<Draft[]> {
  //   const { page, perPage } = input;

  //   return this.draftRepository
  //     .createQueryBuilder('draft')
  //     .where('draft.releaseId = :releaseId', { releaseId: release.id })
  //     .take(perPage)
  //     .skip((page - 1) * perPage)
  //     .getMany();
  // }
}

export default ReleaseResolver;
