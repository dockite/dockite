import { gql } from '@apollo/client/core';

export interface DeleteSchemaMutationResponse {
  deleteSchema: boolean;
}

export interface DeleteSchemaMutationVariables {
  input: {
    id: string;
  };
}

export const DELETE_SCHEMA_MUTATION = gql`
  mutation DeleteSchema($input: DeleteSchemaArgs!) {
    deleteSchema(input: $input)
  }
`;
