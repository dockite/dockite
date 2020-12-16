import gql from 'graphql-tag';

import { User } from '@dockite/database';

export interface LoginMutationResponse {
  login: {
    user: User;
    token: string;
  };
}

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
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
