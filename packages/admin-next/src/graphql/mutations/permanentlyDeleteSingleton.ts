import { gql } from '@apollo/client/core';

export interface PermanentDeleteSingletonMutationResponse {
  permanentlyDeleteSingleton: boolean;
}

export interface PermanentDeleteSingletonMutationVariables {
  input: {
    id: string;
  };
}

export const PERMANENT_DELETE_SINGLETON_MUTATION = gql`
  mutation PermanentlyDeleteSingleton($input: DeleteSingletonArgs!) {
    permanentlyDeleteSingleton(input: $input)
  }
`;
