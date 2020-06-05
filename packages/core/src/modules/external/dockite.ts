import { createSchema } from '@dockite/transformer';
import { GraphQLSchema } from 'graphql';
import { getRepository } from 'typeorm';

import { Document, Schema } from '../../entities';
import { dockiteFields } from '../../fields';

export const createExtraGraphQLSchema = async (): Promise<GraphQLSchema> => {
  const dockiteSchemas = await getRepository(Schema).find({
    where: { deletedAt: null },
    relations: ['fields'],
  });

  const documentRepository = getRepository(Document);

  const dockiteSchemasFiltered = dockiteSchemas.filter(schema => schema.fields.length > 0);

  const schema = await createSchema(dockiteSchemasFiltered, documentRepository, dockiteFields);

  return schema;
};
