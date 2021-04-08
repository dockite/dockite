import { gql } from '@apollo/client/core';

import { Singleton } from '@dockite/database';

import { BaseSchema } from '~/common/types';

export interface ImportSingletonMutationResponse {
  importSingleton: Singleton;
}

export interface ImportSingletonMutationVariables {
  input: {
    id?: string;
    payload: BaseSchema;
  };
}

export const IMPORT_SINGLETON_MUTATION = gql`
  mutation ImportSingleton($input: ImportSingletonArgs!) {
    importSingleton(input: $input) {
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
