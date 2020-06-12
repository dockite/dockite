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

import { Authenticated } from '../../../common/authorizers';
import { SchemaType } from '../../../common/types';
import { Document, Schema } from '../../../entities';
import { DockiteEvents } from '../../../events';

// const log = debug('dockite:core:resolvers');

@ObjectType()
class ManySchemas {
  @GraphQLField(_type => [Schema])
  results!: Schema[];

  @GraphQLField(_type => Int)
  totalItems!: number;

  @GraphQLField(_type => Int)
  currentPage!: number;

  @GraphQLField(_type => Int)
  totalPages!: number;

  @GraphQLField(_type => Boolean)
  hasNextPage!: boolean;
}

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

    schema.groups = schema.groups.reduce(
      (acc: Record<string, string[]>, curr: Record<string, string[]>) => ({ ...acc, ...curr }),
      {},
    );

    return schema;
  }

  /**
   * TODO: Move this to and Connection/Edge model
   */
  @Authenticated()
  @Query(_returns => ManySchemas)
  async allSchemas(
    @Arg('page', _type => Int, { defaultValue: 1 })
    page: number,
    @Arg('perPage', _type => Int, { defaultValue: 20 })
    perPage: number,
  ): Promise<ManySchemas> {
    const repository = getRepository(Schema);

    const [results, totalItems] = await repository.findAndCount({
      where: { deletedAt: null },
      relations: ['fields'],
      take: perPage,
      skip: perPage * (page - 1),
    });

    results.forEach(schema => {
      // eslint-disable-next-line no-param-reassign
      schema.groups = schema.groups.reduce(
        (acc: Record<string, string[]>, curr: Record<string, string[]>) => ({ ...acc, ...curr }),
        {},
      );
    });

    const totalPages = Math.ceil(totalItems / perPage);

    return {
      results,
      currentPage: page,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
    };
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

    const preservedGroups = Object.keys(groups).map(key => ({ [key]: groups[key] }));

    const schema = repository.create({
      name,
      type,
      groups: preservedGroups,
      settings,
    });

    const savedSchema = await repository.save(schema);

    DockiteEvents.emit('reload');

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

    const preservedGroups = Object.keys(groups).map(key => ({ [key]: groups[key] }));

    schema.groups = preservedGroups;
    schema.settings = settings;

    const savedSchema = await repository.save(schema);

    DockiteEvents.emit('reload');

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

      DockiteEvents.emit('reload');

      return true;
    } catch {
      return false;
    }
  }
}
