import { gql } from '@apollo/client/core';

export interface DeleteApiKeyMutationResponse {
  deleteApiKey: boolean;
}

export interface DeleteApiKeyMutationVariables {
  key: string;
}

export const DELETE_API_KEY_MUTATION = gql`
  mutation DeleteApiKey($key: String!) {
    deleteApiKey(key: $key)
  }
`;
