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
      .filter(e => e.fields.length > 0)
      .map(
        async e =>
          new GraphQLSchema({
            query: await createSchemaForEntity(e, documentRepository),
          }),
      ),
  );

  return schemas;
};
