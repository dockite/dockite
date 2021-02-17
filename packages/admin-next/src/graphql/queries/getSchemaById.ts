import { Schema } from '@dockite/database';
import gql from 'graphql-tag';

export interface GetSchemaByIdQueryResponse {
  getSchema: Schema;
}

export interface GetSchemaByIdQueryVariables {
  id: string;
}

export const GET_SCHEMA_BY_ID_QUERY = gql`
  query GetSchemaById($id: String!) {
    getSchema(id: $id) {
      id
      name
      title
      type
      groups
      settings
      fields {
        id
        name
        title
        description
        type
        settings
      }
      createdAt
      updatedAt
    }
  }
`;

export default GET_SCHEMA_BY_ID_QUERY;
