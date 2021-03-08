import { gql } from '@apollo/client/core';

import { Schema } from '@dockite/database';

export interface GetSchemaByIdQueryResponse {
  getSchema: Schema;
}

export interface GetSchemaByIdQueryVariables {
  id: string;
  deleted?: boolean;
}

export const GET_SCHEMA_BY_ID_QUERY = gql`
  query GetSchemaById($id: String!, $deleted: Boolean = false) {
    getSchema(id: $id, deleted: $deleted) {
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
