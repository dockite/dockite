import { createSchema } from '@dockite/transformer';
import { GraphQLSchema } from 'graphql';
import { getRepository, Repository } from 'typeorm';

import { Document, Schema } from '../../entities';

export const createExtraGraphQLSchema = async (): Promise<GraphQLSchema> => {
  const dockiteSchemas = await getRepository(Schema).find({
    relations: ['fields'],
  });

  const documentRepository = getRepository(Document);

  const dockiteSchemasFiltered = dockiteSchemas.filter(schema => schema.fields.length > 0);

  const schema = await createSchema(dockiteSchemasFiltered, documentRepository);

  return schema;
};
