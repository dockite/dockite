import { Arg, Authorized, Mutation, Query, Resolver } from 'type-graphql';
import { getRepository } from 'typeorm';
import GraphQLJSON from 'graphql-type-json';

import { SchemaType } from '../../../common/types';
import { Document, Schema } from '../../../entities';

@Resolver(_of => Schema)
export class SchemaResolver {
  @Authorized()
  @Query(_returns => Schema, { nullable: true })
  async getSchema(@Arg('id') id: string): Promise<Schema | null> {
    const repository = getRepository(Schema);

    const schema = await repository.findOne({
      where: { id, deletedAt: null },
    });

    return schema ?? null;
  }

  /**
   * TODO: Move this to and Connection/Edge model
   */
  @Authorized()
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
  @Authorized()
  @Mutation(_returns => Schema)
  async createSchema(
    @Arg('name') name: string,
    @Arg('type') type: number,
    @Arg('groups', _type => GraphQLJSON) groups: any, // eslint-disable-line
    @Arg('settings', _type => GraphQLJSON) settings: any, // eslint-disable-line
    @Arg('fields', _type => GraphQLJSON) fields: any, // eslint-disable-line
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
      fields,
    });

    const savedSchema = await repository.save(schema);

    return savedSchema;
  }

  /**
   * TODO: Possibly add a check for if the Schema exists and throw
   */
  @Authorized()
  @Mutation(_returns => Boolean)
  async removeSchema(@Arg('id') id: string): Promise<boolean> {
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
