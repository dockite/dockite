import { gql } from '@apollo/client/core';

export interface PermanentDeleteSchemaMutationResponse {
  permanentlyDeleteSchema: boolean;
}

export interface PermanentDeleteSchemaMutationVariables {
  input: {
    id: string;
  };
}

export const PERMANENT_DELETE_SCHEMA_MUTATION = gql`
  mutation PermanentlyDeleteSchema($input: DeleteSchemaArgs!) {
    permanentlyDeleteSchema(input: $input)
  }
`;
