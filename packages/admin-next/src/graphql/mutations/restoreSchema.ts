import { gql } from '@apollo/client/core';

import { Schema } from '@dockite/database';

export interface RestoreSchemaMutationResponse {
  restoreSchema: Schema;
}

export interface RestoreSchemaMutationVariables {
  id: string;
}

export const RESTORE_SCHEMA_MUTATION = gql`
  mutation RestoreSchema($id: String!) {
    restoreSchema(id: $id) {
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
