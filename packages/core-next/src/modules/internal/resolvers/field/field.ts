import debug from 'debug';
import { Arg, Args, Mutation, Query, Resolver } from 'type-graphql';
import { getRepository, Repository } from 'typeorm';

import { Field, Schema } from '@dockite/database';

import { Authenticated, Authorized } from '../../../../common/decorators';
import { createFindManyResult } from '../document/util';
import { updateDocumentsWithFieldChanges } from '../schema/util';

import {
  AllFieldsArgs,
  CreateFieldArgs,
  DeleteFieldArgs,
  GetFieldArgs,
  UpdateFieldArgs,
} from './args';
import { FindManyFieldsResult } from './types';

const log = debug('dockite:core:resolvers:field');

/**
 *
 */
@Resolver(_of => Field)
export class FieldResolver {
  private fieldRepository: Repository<Field>;

  private schemaRepository: Repository<Schema>;

  constructor() {
    this.fieldRepository = getRepository(Field);
    this.schemaRepository = getRepository(Schema);
  }

  @Authenticated()
  @Authorized({
    scope: 'internal:schema:read',
    deriveFurtherAlternativeScopes: true,
    checkArgsOrFields: true,
    fieldsOrArgsToLookup: ['schemaId'],
  })
  @Query(_returns => Field)
  public async getField(
    @Args()
    input: GetFieldArgs,
  ): Promise<Field> {
    const { id } = input;

    try {
      const field = await this.fieldRepository.findOneOrFail(id, { relations: ['schema'] });

      return field;
    } catch (err) {
      log(err);

      throw new Error(`Unable to retrieve field with ID: ${id}`);
    }
  }

  @Authenticated()
  @Authorized({
    scope: 'internal:schema:read',
    deriveFurtherAlternativeScopes: true,
    checkArgsOrFields: true,
    fieldsOrArgsToLookup: ['schemaId'],
  })
  @Query(_returns => FindManyFieldsResult)
  public async allFields(
    @Args()
    input: AllFieldsArgs,
  ): Promise<FindManyFieldsResult> {
    const { page, perPage } = input;

    try {
      const qb = this.fieldRepository
        .createQueryBuilder('field')
        .where('1 = 1')
        .leftJoinAndSelect('field.schema', 'schema');

      const [results, count] = await qb.getManyAndCount();

      return createFindManyResult(results, count, page, perPage);
    } catch (err) {
      log(err);

      throw new Error('An error occurred while retrieving fields');
    }
  }

  @Authenticated()
  @Authorized({
    scope: 'internal:schema:update',
  })
  @Mutation(_returns => Field)
  public async createField(
    @Arg('input', _type => CreateFieldArgs)
    input: CreateFieldArgs,
  ): Promise<Field> {
    const { name, title, type, description, priority, settings, schemaId } = input;

    try {
      const schema = await this.schemaRepository.findOne(schemaId);

      if (!schema) {
        throw new Error('The schema provided for the field could not be found');
      }

      const field = await this.fieldRepository.save({
        name,
        title,
        type,
        description,
        priority,
        settings,
        schemaId,
      });

      await updateDocumentsWithFieldChanges(schema, [], [], [field]);

      field.setDockiteField();

      if (field.dockiteField) {
        await field.dockiteField.onFieldCreate();
      }

      return field;
    } catch (err) {
      log(err);

      throw new Error('An error occurred while attempting to create the field');
    }
  }

  @Authenticated()
  @Authorized({
    scope: 'internal:schema:update',
  })
  @Mutation(_returns => Field)
  public async updateField(
    @Arg('input', _type => UpdateFieldArgs)
    input: UpdateFieldArgs,
  ): Promise<Field> {
    const { id, name, title, type, description, priority, settings, schemaId } = input;

    try {
      const field = await this.fieldRepository.findOne(id, { relations: ['schema'] });

      if (!field) {
        throw new Error('The field to be updated could not be found');
      }

      let schema = field.schema as Schema | undefined;

      if (schema?.id !== field.schemaId) {
        schema = await this.schemaRepository.findOne(schemaId);
      }

      if (!schema) {
        throw new Error('The schema provided for the field could not be found');
      }

      const updatedField = await this.fieldRepository.save({
        id,
        name,
        title,
        type,
        description,
        priority,
        settings,
        schemaId,
      });

      // Handle the renaming of a field
      if (field.name !== updatedField.name) {
        const updatedFieldWithOldField = { ...updatedField, oldField: { ...field } };

        await updateDocumentsWithFieldChanges(schema, [updatedFieldWithOldField], [], []);
      }

      updatedField.setDockiteField();

      if (updatedField.dockiteField) {
        await updatedField.dockiteField.onFieldUpdate();
      }

      return updatedField;
    } catch (err) {
      log(err);

      throw new Error('An error occurred while attempting to create the field');
    }
  }

  @Authenticated()
  @Authorized({
    scope: 'internal:schema:update',
  })
  @Mutation(_returns => Boolean)
  public async deleteField(
    @Arg('input', _type => DeleteFieldArgs)
    input: DeleteFieldArgs,
  ): Promise<boolean> {
    const { id } = input;

    try {
      const field = await this.fieldRepository.findOne(id, { relations: ['schema'] });

      if (!field) {
        throw new Error('The field to be deleted could not be found');
      }

      const { schema } = field;

      await this.fieldRepository.remove(field);

      await updateDocumentsWithFieldChanges(schema, [], [field], []);

      return true;
    } catch (err) {
      log(err);

      return false;
    }
  }
}

export default FieldResolver;
