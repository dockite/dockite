import { gql } from '@apollo/client/core';

import { Schema } from '@dockite/database';

import { BaseSchema } from '~/common/types';

export interface UpdateSchemaMutationResponse {
  updateSchema: Schema;
}

export interface UpdateSchemaMutationVariables {
  input: {
    id?: string;
    payload: BaseSchema;
  };
}

export const UPDATE_SCHEMA_MUTATION = gql`
  mutation UpdateSchema($input: ImportSchemaArgs!) {
    updateSchema: importSchema(input: $input) {
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
