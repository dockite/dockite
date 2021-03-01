import gql from 'graphql-tag';

import { Singleton } from '@dockite/database';

import { BaseSchema } from '~/common/types';

export interface CreateSingletonMutationResponse {
  createSingleton: Singleton;
}

export interface CreateSingletonMutationVariables {
  payload: BaseSchema;
}

export const CREATE_SINGLETON_MUTATION = gql`
  mutation CreateSingleton($payload: JSON!) {
    createSingleton: importSingleton(payload: $payload) {
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
