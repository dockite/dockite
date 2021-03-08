import { gql } from '@apollo/client/core';

export interface PermanentDeleteSchemaMutationResponse {
  permanentDeleteSchema: boolean;
}

export interface PermanentDeleteSchemaMutationVariables {
  id: string;
}

export const PERMANENT_DELETE_SCHEMA_MUTATION = gql`
  mutation PermanentDeleteSchema($id: String!) {
    permanentDeleteSchema: permanentlyRemoveSchema(id: $id)
  }
`;
