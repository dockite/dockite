import { createSchema } from '@dockite/transformer';
import { GraphQLSchema } from 'graphql';
import { getRepository } from 'typeorm';
import { Document, Schema } from '@dockite/database';
import { FieldManager, registerScopes } from '@dockite/manager';

// TODO: Tidy this area, createSchema likely does not need access to all the items it currently does.
export const createExtraGraphQLSchema = async (): Promise<GraphQLSchema> => {
  const dockiteSchemas = await getRepository(Schema).find({
    relations: ['fields'],
  });

  dockiteSchemas.forEach(schema => {
    const schemaName = schema.name.toLowerCase();

    registerScopes(
      `${schemaName}:create`,
      `${schemaName}:read`,
      `${schemaName}:update`,
      `${schemaName}:delete`,
    );
  });

  const documentRepository = getRepository(Document);

  const dockiteSchemasFiltered = dockiteSchemas.filter(schema => schema.fields.length > 0);

  const schema = await createSchema(dockiteSchemasFiltered, documentRepository, FieldManager);

  return schema;
};
