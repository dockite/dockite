import gql from 'graphql-tag';

import { User } from '@dockite/database';

export interface MeQueryResponse {
  me: User;
}

export const ME_QUERY = gql`
  query Me {
    me {
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
  }
`;

export default ME_QUERY;
