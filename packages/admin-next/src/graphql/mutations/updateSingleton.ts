import { gql } from '@apollo/client/core';

import { Singleton } from '@dockite/database';

import { BaseSchema } from '~/common/types';

export interface UpdateSingletonMutationResponse {
  updateSingleton: Singleton;
}

export interface UpdateSingletonMutationVariables {
  input: {
    id?: string;
    payload: BaseSchema;
  };
}

export const UPDATE_SINGLETON_MUTATION = gql`
  mutation UpdateSingleton($input: ImportSingletonArgs!) {
    updateSingleton: importSingleton(input: $input) {
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
