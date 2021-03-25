import { gql } from '@apollo/client/core';

import { User } from '@dockite/database';

export interface RegisterFirstUserMutationResponse {
  registerFirstUser: {
    user: User;
    token: string;
  };
}

export interface RegisterFirstUserMutationVariables {
  input: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
  };
}

export const REGISTER_FIRST_USER_MUTATION = gql`
  mutation RegisterFirstUser($input: RegistrationInputArgs!) {
    registerFirstUser(input: $input) {
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
