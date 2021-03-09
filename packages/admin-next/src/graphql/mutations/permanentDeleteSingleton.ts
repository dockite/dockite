import { gql } from '@apollo/client/core';

export interface PermanentDeleteSingletonMutationResponse {
  permanentDeleteSingleton: boolean;
}

export interface PermanentDeleteSingletonMutationVariables {
  id: string;
}

export const PERMANENT_DELETE_SINGLETON_MUTATION = gql`
  mutation PermanentDeleteSingleton($id: String!) {
    permanentDeleteSingleton: permanentlyRemoveSingleton(id: $id)
  }
`;