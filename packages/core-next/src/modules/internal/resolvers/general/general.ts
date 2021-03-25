/* eslint-disable class-methods-use-this */
import debug from 'debug';
import { Args, Query, Resolver } from 'type-graphql';
import { getRepository, Repository } from 'typeorm';

import { Document, User } from '@dockite/database';
import { FieldManager } from '@dockite/manager';

import { Authenticated } from '../../../../common/decorators';
import { FindManyDocumentsResult } from '../document/types';
import { createFindManyResult } from '../document/util';

import { ResolveReferenceOfArgs } from './args';
import { RegisteredDockiteField } from './types';

const log = debug('dockite:core:resolvers:general');

/**
 *
 */
@Resolver()
export class GeneralResolver {
  private userRepository: Repository<User>;

  private documentRepository: Repository<Document>;

  constructor() {
    this.userRepository = getRepository(User);

    this.documentRepository = getRepository(Document);
  }

  @Authenticated()
  @Query(_returns => [RegisteredDockiteField])
  public availableFields(): RegisteredDockiteField[] {
    return Object.values(FieldManager);
  }

  @Query(_returns => Boolean)
  public async newInstallation(): Promise<boolean> {
    const count = await this.userRepository.count({ withDeleted: true });

    return count === 0;
  }

  @Query(_returns => FindManyDocumentsResult)
  public async resolveReferenceOf(
    @Args()
    input: ResolveReferenceOfArgs,
  ): Promise<FindManyDocumentsResult> {
    const { documentId, schemaId, fieldName, page, perPage } = input;

    try {
      const [documents, count] = await this.documentRepository
        .createQueryBuilder('document')
        .leftJoinAndSelect('document.schema', 'schema')
        .andWhere('schema.id = :schemaId', { schemaId })
        .andWhere(`document.data -> :fieldName ->> 'id' = :documentId`, {
          fieldName,
          documentId,
        })
        .take(perPage)
        .skip(perPage * (page - 1))
        .orderBy('document.updatedAt', 'DESC')
        .getManyAndCount();

      return createFindManyResult(documents, count, page, perPage);
    } catch (err) {
      log(err);

      throw new Error('Unable to retrieve reference of documents using provided input');
    }
  }
}

export default GeneralResolver;
