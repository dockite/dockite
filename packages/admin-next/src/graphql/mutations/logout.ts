import { gql } from '@apollo/client/core';

export interface LogoutMutationResponse {
  logout: boolean;
}

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;
