import { createSchemaForEntity } from '@dockite/transformer';
import { GraphQLSchema } from 'graphql';
import { getRepository } from 'typeorm';

import { Document, Schema } from '../../entities';

export const createGraphQLSchemas = async (): Promise<GraphQLSchema[]> => {
  const entities = await getRepository(Schema).find({
    relations: ['fields'],
  });

  const documentRepository = getRepository(Document);

  const schemas = await Promise.all(
    entities
      .filter(schema => schema.fields.length > 0)
      .map(
        async schema =>
          new GraphQLSchema({
            query: await createSchemaForEntity<Document>(schema, documentRepository),
          }),
      ),
  );

  return schemas;
};
