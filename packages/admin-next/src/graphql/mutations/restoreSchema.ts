import { gql } from '@apollo/client/core';

import { Schema } from '@dockite/database';

export interface RestoreSchemaMutationResponse {
  restoreSchema: Schema;
}

export interface RestoreSchemaMutationVariables {
  input: {
    id: string;
  };
}

export const RESTORE_SCHEMA_MUTATION = gql`
  mutation RestoreSchema($input: RestoreSchemaArgs!) {
    restoreSchema(input: $input) {
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
