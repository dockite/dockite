import { GlobalContext, Schema } from '@dockite/types';
import { GraphQLFieldConfigMap, GraphQLObjectType, Source } from 'graphql';

export const createSchemaResolver = async (entity: Schema): Promise<GraphQLObjectType> => {
  // Build our empty field map
  const typeFields: GraphQLFieldConfigMap<Source, GlobalContext> = {};

  // Retrieve our field configs from the registered dockite-fields
  const fieldsMap = await Promise.all(
    entity.fields.map(async field => ({
      name: field.name,
      // eslint-disable-next-line
      type: await field.dockiteField!.outputType<Source, GlobalContext>(),
    })),
  );

  // Then add all non-null fields
  fieldsMap.forEach(field => {
    if (field.type !== null) {
      typeFields[field.name] = field.type;
    }
  });

  // Finally return the built object type
  return new GraphQLObjectType({
    name: entity.name,
    fields: typeFields,
  });
};
