import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import { getRepository } from 'typeorm';
import GraphQLJSON from 'graphql-type-json';
import debug from 'debug';

import { Authenticated } from '../../../common/authorizers';
import { SchemaType } from '../../../common/types';
import { Document, Schema } from '../../../entities';

const log = debug('dockite:core:resolvers');

@Resolver(_of => Schema)
export class SchemaResolver {
  @Authenticated()
  @Query(_returns => Schema, { nullable: true })
  async getSchema(
    @Arg('id', _type => String, { nullable: true }) id: string | null,
    @Arg('name', _type => String, { nullable: true }) name: string | null,
  ): Promise<Schema | null> {
    const repository = getRepository(Schema);

    let schema;

    if (id) {
      schema = await repository.findOne({
        where: { id, deletedAt: null },
        relations: ['fields'],
      });
    } else if (name) {
      schema = await repository.findOne({
        relations: ['fields'],
        where: { name, deletedAt: null },
      });
    }

    if (!schema) {
      return null;
    }

    return schema;
  }

  /**
   * TODO: Move this to and Connection/Edge model
   */
  @Authenticated()
  @Query(_returns => [Schema])
  async allSchemas(): Promise<Schema[] | null> {
    const repository = getRepository(Schema);

    const schemas = await repository.find({
      where: { deletedAt: null },
    });

    return schemas ?? null;
  }

  /**
   * TODO: Perform light validation on fields, settings, groups
   */
  @Authenticated()
  @Mutation(_returns => Schema)
  async createSchema(
    @Arg('name')
    name: string,
    @Arg('type', _type => SchemaType)
    type: SchemaType,
    @Arg('groups', _type => GraphQLJSON)
    groups: any, // eslint-disable-line
    @Arg('settings', _type => GraphQLJSON)
    settings: any, // eslint-disable-line
  ): Promise<Schema | null> {
    const repository = getRepository(Schema);

    if (!Object.values(SchemaType).includes(type as SchemaType)) {
      throw new Error('SchemaType provided is invalid');
    }

    const schema = repository.create({
      name,
      type,
      groups,
      settings,
    });

    const savedSchema = await repository.save(schema);

    return savedSchema;
  }

  /**
   * TODO: Perform light validation on fields, settings, groups
   */
  @Authenticated()
  @Mutation(_returns => Schema)
  async updateSchema(
    @Arg('id')
    schemaId: string,
    @Arg('groups', _type => GraphQLJSON)
    groups: any, // eslint-disable-line
    @Arg('settings', _type => GraphQLJSON)
    settings: any, // eslint-disable-line
  ): Promise<Schema | null> {
    const repository = getRepository(Schema);
    const schema = await repository.findOneOrFail({
      where: { id: schemaId },
    });

    schema.groups = groups;
    schema.settings = settings;

    const savedSchema = await repository.save(schema);

    return savedSchema;
  }

  /**
   * TODO: Possibly add a check for if the Schema exists and throw
   */
  @Authenticated()
  @Mutation(_returns => Boolean)
  async removeSchema(
    @Arg('id')
    id: string,
  ): Promise<boolean> {
    const repository = getRepository(Schema);

    try {
      const deletedAt = new Date();

      await repository.update({ id }, { deletedAt });
      await getRepository(Document).update({ schemaId: id }, { deletedAt });

      return true;
    } catch {
      return false;
    }
  }
}
