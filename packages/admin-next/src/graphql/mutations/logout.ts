import gql from 'graphql-tag';

export interface LogoutMutationResponse {
  logout: boolean;
}

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;
