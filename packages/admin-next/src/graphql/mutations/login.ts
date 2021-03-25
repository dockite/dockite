import { gql } from '@apollo/client/core';

import { User } from '@dockite/database';

export interface LoginMutationResponse {
  login: {
    user: User;
    token: string;
  };
}

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInputArgs!) {
    login(input: $input) {
      user {
        id
        firstName
        lastName
        email
        roles {
          name
        }
        scopes
        normalizedScopes
        apiKeys
        createdAt
        updatedAt
        verified
      }
      token
    }
  }
`;
