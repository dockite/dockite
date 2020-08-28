import { GraphQLObjectType, GraphQLString } from 'graphql';
import { GraphQLDateTime } from 'graphql-iso-date';

export const DocumentMetadata = new GraphQLObjectType({
  name: 'DockiteDocumentMetadata',
  fields: {
    id: { type: GraphQLString },
    schemaId: { type: GraphQLString },
    createdAt: { type: GraphQLDateTime },
    updatedAt: { type: GraphQLDateTime },
    publishedAt: { type: GraphQLDateTime },
  },
});
