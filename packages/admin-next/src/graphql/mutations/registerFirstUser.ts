import { User } from '@dockite/database';
import { gql } from '@apollo/client/core';

export interface RegisterFirstUserMutationResponse {
  registerFirstUser: {
    user: User;
    token: string;
  };
}

export const REGISTER_FIRST_USER_MUTATION = gql`
  mutation RegisterFirstUser(
    $email: String!
    $firstName: String!
    $lastName: String!
    $password: String!
  ) {
    registerFirstUser(
      email: $email
      firstName: $firstName
      lastName: $lastName
      password: $password
    ) {
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
