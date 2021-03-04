import { gql } from '@apollo/client/core';

import { Schema } from '@dockite/database';

import { BaseSchema } from '~/common/types';

export interface CreateSchemaMutationResponse {
  createSchema: Schema;
}

export interface CreateSchemaMutationVariables {
  payload: BaseSchema;
}

export const CREATE_SCHEMA_MUTATION = gql`
  mutation CreateSchema($payload: JSON!) {
    createSchema: importSchema(payload: $payload) {
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
