import { gql } from '@apollo/client/core';

export interface CreateApiKeyMutationResponse {
  createApiKey: boolean;
}

export type CreateApiKeyMutationVariables = never;

export const CREATE_API_KEY_MUTATION = gql`
  mutation CreateApiKey {
    createApiKey
  }
`;
