import { gql } from '@apollo/client/core';

import { Singleton } from '@dockite/database';

import { BaseSchema } from '~/common/types';

export interface CreateSingletonMutationResponse {
  createSingleton: Singleton;
}

export interface CreateSingletonMutationVariables {
  input: {
    singletonId?: string;
    payload: BaseSchema;
  };
}

export const CREATE_SINGLETON_MUTATION = gql`
  mutation CreateSingleton($input: ImportSingletonArgs!) {
    createSingleton: importSingleton(input: $input) {
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
