import { gql } from '@apollo/client/core';

import { Schema } from '@dockite/database';

import { BaseSchema } from '~/common/types';

export interface ImportSchemaMutationResponse {
  importSchema: Schema;
}

export interface ImportSchemaMutationVariables {
  input: {
    id?: string;
    payload: BaseSchema;
  };
}

export const IMPORT_SCHEMA_MUTATION = gql`
  mutation ImportSchema($input: ImportSchemaArgs!) {
    importSchema(input: $input) {
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
