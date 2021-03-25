import { gql } from '@apollo/client/core';

export interface DeleteSingletonMutationResponse {
  deleteSingleton: boolean;
}

export interface DeleteSingletonMutationVariables {
  input: {
    id: string;
  };
}

export const DELETE_SINGLETON_MUTATION = gql`
  mutation DeleteSingleton($input: DeleteSingletonArgs!) {
    deleteSingleton(input: $input)
  }
`;
