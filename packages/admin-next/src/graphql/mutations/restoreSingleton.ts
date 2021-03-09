import { gql } from '@apollo/client/core';

import { Singleton } from '@dockite/database';

export interface RestoreSingletonMutationResponse {
  restoreSingleton: Singleton;
}

export interface RestoreSingletonMutationVariables {
  id: string;
}

export const RESTORE_SINGLETON_MUTATION = gql`
  mutation RestoreSingleton($id: String!) {
    restoreSingleton(id: $id) {
      id
      name
      title
      type
      data
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
