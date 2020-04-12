import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import { getRepository } from 'typeorm';
import GraphQLJSON from 'graphql-type-json';

import { Authenticated } from '../../../common/authorizers';
import { Field, Document } from '../../../entities';
import { DockiteEvents } from '../../../events';

@Resolver(_of => Field)
export class FieldResolver {
  @Authenticated()
  @Query(_returns => Field, { nullable: true })
  async getField(@Arg('id') id: string): Promise<Field | null> {
    const repository = getRepository(Field);

    const field = await repository.findOne({
      where: { id, deletedAt: null },
    });

    return field ?? null;
  }

  /**
   * TODO: Move this to and Connection/Edge model
   */
  @Authenticated()
  @Query(_returns => [Field])
  async allFields(): Promise<Field[] | null> {
    const repository = getRepository(Field);

    const fields = await repository.find({
      where: { deletedAt: null },
    });

    return fields ?? null;
  }

  /**
   * TODO: Perform light validation on fields, settings, groups
   */
  @Authenticated()
  @Mutation(_returns => Field)
  async createField(
    @Arg('name') name: string,
    @Arg('title') title: string,
    @Arg('description') description: string,
    @Arg('type') type: string,
    // eslint-disable-next-line
    @Arg('settings', _type => GraphQLJSON) settings: Record<string, any>,
    @Arg('schemaId') schemaId: string,
  ): Promise<Field | null> {
    const repository = getRepository(Field);

    const field = repository.create({
      name,
      title,
      description,
      type,
      settings,
      schemaId,
    });

    const savedField = await repository.save(field);

    DockiteEvents.emit('reload');

    return savedField;
  }

  /**
   * TODO: Possibly add a check for if the Field exists and throw
   */
  @Authenticated()
  @Mutation(_returns => Boolean)
  async removeField(@Arg('id') id: string): Promise<boolean> {
    const repository = getRepository(Field);

    try {
      const field = await repository.findOneOrFail(id);

      await Promise.all([
        repository.delete(field.id),
        getRepository(Document)
          .createQueryBuilder()
          .update()
          .set({
            data: () => `data - '${field.name}'`,
          })
          .where('schemaId = :schemaId', { schemaId: field.schemaId })
          .execute(),
      ]);

      DockiteEvents.emit('reload');

      return true;
    } catch {
      return false;
    }
  }
}
