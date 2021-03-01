import gql from 'graphql-tag';

export interface DeleteSchemaMutationResponse {
  deleteSchema: boolean;
}

export interface DeleteSchemaMutationVariables {
  id: string;
}

export const DELETE_SCHEMA_MUTATION = gql`
  mutation DeleteSchema($id: String!) {
    deleteSchema: removeSchema(id: $id)
  }
`;
