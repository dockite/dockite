import { gql } from '@apollo/client/core';

export interface DeleteSingletonMutationResponse {
  deleteSingleton: boolean;
}

export interface DeleteSingletonMutationVariables {
  id: string;
}

export const DELETE_SINGLETON_MUTATION = gql`
  mutation DeleteSingleton($id: String!) {
    deleteSingleton: removeSingleton(id: $id)
  }
`;
