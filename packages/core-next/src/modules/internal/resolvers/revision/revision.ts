import debug from 'debug';
import { cloneDeep, merge } from 'lodash';
import { Arg, Args, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { getRepository, Repository } from 'typeorm';

import { Document, DocumentRevision, Field, Schema, SchemaRevision } from '@dockite/database';
import { GlobalContext } from '@dockite/types';

import { Authenticated, Authorized } from '../../../../common/decorators';
import { getInitialDocumentData } from '../../../../common/util';
import { createFindManyResult } from '../document/util';
import {
  getCreatedSchemaFieldsFromPayload,
  getDeletedSchemaFieldsFromPayload,
  getRenamedSchemaFieldsFromPayload,
  reviseAllDocumentsForSchema,
  updateDocumentsWithFieldChanges,
} from '../schema/util';

import {
  GetRevisionsForDocumentArgs,
  GetRevisionsForSchemaArgs,
  RestoreDocumentRevisionArgs,
  RestoreSchemaRevisionArgs,
} from './args';
import { FindManyDocumentRevisionsResult, FindManySchemaRevisionsResult } from './types';

const log = debug('dockite:core:resolvers:revision');

/**
 *
 */
@Resolver()
export class RevisionResolver {
  private documentRepository: Repository<Document>;

  private documentRevisionRepository: Repository<DocumentRevision>;

  private schemaRepository: Repository<Schema>;

  private schemaRevisionRepository: Repository<SchemaRevision>;

  private fieldRepository: Repository<Field>;

  constructor() {
    this.documentRepository = getRepository(Document);

    this.documentRevisionRepository = getRepository(DocumentRevision);

    this.schemaRepository = getRepository(Schema);

    this.schemaRevisionRepository = getRepository(SchemaRevision);

    this.fieldRepository = getRepository(Field);
  }

  @Authenticated()
  @Authorized({
    scope: 'internal:document:read',
    deriveFurtherAlternativeScopes: true,
    resourceType: 'schema',
    checkArgsOrFields: true,
    fieldsOrArgsToLookup: ['schemaId'],
  })
  @Query(_returns => FindManyDocumentRevisionsResult)
  public async getRevisionsForDocument(
    @Args()
    input: GetRevisionsForDocumentArgs,
  ): Promise<FindManyDocumentRevisionsResult> {
    const { documentId, page, perPage } = input;

    try {
      const [revisions, count] = await this.documentRevisionRepository
        .createQueryBuilder('revision')
        .where('revision.documentId = :documentId', { documentId })
        .take(perPage)
        .skip(page)
        .getManyAndCount();

      return createFindManyResult(revisions, count, page, perPage);
    } catch (err) {
      log(err);

      throw new Error(`Unable to retrieve revisions for document with ID: ${documentId}`);
    }
  }

  @Authenticated()
  @Authorized({
    scope: 'internal:document:update',
    deriveFurtherAlternativeScopes: true,
    resourceType: 'schema',
    checkArgsOrFields: true,
    fieldsOrArgsToLookup: ['schemaId'],
    entity: Document,
    entityIdentifierArgument: 'input.documentId',
  })
  @Mutation(_returns => Document)
  public async restoreDocumentRevision(
    @Arg('input', _type => RestoreDocumentRevisionArgs)
    input: RestoreDocumentRevisionArgs,
    @Ctx()
    ctx: GlobalContext,
  ): Promise<Document> {
    const { documentId, revisionId } = input;

    try {
      const [document, revision] = await Promise.all([
        this.documentRepository.findOneOrFail(documentId, {
          relations: ['schema', 'schema.fields'],
        }),
        this.documentRevisionRepository.findOneOrFail(revisionId),
      ]);

      if (revision.documentId !== document.id) {
        throw new Error('Revision ID provided does not belong to provided document ID');
      }

      const [updatedDocument] = await Promise.all([
        this.documentRepository.save({
          ...document,
          data: merge(getInitialDocumentData(document.schema), revision.data),
        }),
        this.documentRevisionRepository.save({
          documentId: document.id,
          schemaId: document.schemaId,
          userId: ctx.user?.id,
          data: cloneDeep(document.data),
        }),
      ]);

      return merge(updatedDocument, document);
    } catch (err) {
      log(err);

      throw new Error(`Unable to restore revision on document with ID: ${documentId}`);
    }
  }

  @Authenticated()
  @Authorized({
    scope: 'internal:schema:read',
  })
  @Query(_returns => FindManySchemaRevisionsResult)
  public async getRevisionsForSchema(
    @Args()
    input: GetRevisionsForSchemaArgs,
  ): Promise<FindManySchemaRevisionsResult> {
    const { schemaId, page, perPage } = input;

    try {
      const [revisions, count] = await this.schemaRevisionRepository
        .createQueryBuilder('revision')
        .where('revision.schemaId = :schemaId', { schemaId })
        .take(perPage)
        .skip(page)
        .getManyAndCount();

      return createFindManyResult(revisions, count, page, perPage);
    } catch (err) {
      log(err);

      throw new Error(`Unable to retrieve revisions for schema with ID: ${schemaId}`);
    }
  }

  @Authenticated()
  @Authorized({
    scope: 'internal:schema:update',
  })
  @Mutation(_returns => Schema)
  public async restoreSchemaRevision(
    @Arg('input', _type => RestoreSchemaRevisionArgs)
    input: RestoreSchemaRevisionArgs,
    @Ctx()
    ctx: GlobalContext,
  ): Promise<Schema> {
    const { schemaId, revisionId } = input;

    try {
      const [schema, revision] = await Promise.all([
        this.schemaRepository.findOneOrFail(schemaId, {
          relations: ['fields'],
        }),
        this.schemaRevisionRepository.findOneOrFail(revisionId),
      ]);

      if (revision.schemaId !== schema.id) {
        throw new Error('Revision ID provided does not belong to provided schema ID');
      }

      const revisionSchema = revision.data as Schema;

      // Reconcile the field changes between the schema
      const fieldsThatHaveBeenRenamed = getRenamedSchemaFieldsFromPayload(
        schema.fields,
        revisionSchema.fields,
      );

      const fieldsThatHaveBeenDeleted = getDeletedSchemaFieldsFromPayload(
        schema.fields,
        revisionSchema.fields,
      );

      const fieldsThatHaveBeenCreated = getCreatedSchemaFieldsFromPayload(
        schema.fields,
        revisionSchema.fields,
      );

      const fieldDeletionPromise = this.fieldRepository.remove(fieldsThatHaveBeenDeleted);

      if (
        fieldsThatHaveBeenCreated.length > 0 ||
        fieldsThatHaveBeenDeleted.length > 0 ||
        fieldsThatHaveBeenCreated.length > 0
      ) {
        await reviseAllDocumentsForSchema(schema, ctx.user?.id ?? null);

        await updateDocumentsWithFieldChanges(
          schema,
          fieldsThatHaveBeenRenamed,
          fieldsThatHaveBeenDeleted,
          fieldsThatHaveBeenCreated,
        );
      }

      const [updatedSchema] = await Promise.all([
        this.schemaRepository.save({
          ...schema,
          ...revision,
          fields: revisionSchema.fields.map(field => this.fieldRepository.create(field)),
        }),
        fieldDeletionPromise,
      ]);

      return merge(updatedSchema, schema);
    } catch (err) {
      log(err);

      throw new Error(`Unable to restore revision on schema with ID: ${schemaId}`);
    }
  }
}

export default RevisionResolver;
