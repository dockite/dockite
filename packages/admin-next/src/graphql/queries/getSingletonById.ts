import { Singleton } from '@dockite/database';
import gql from 'graphql-tag';

export interface GetSingletonByIdQueryResponse {
  getSingleton: Singleton;
}

export interface GetSingletonByIdQueryVariables {
  id: string;
}

export const GET_SINGLETON_BY_ID_QUERY = gql`
  query GetSingletonById($id: String!) {
    getSingleton(id: $id) {
      id
      name
      title
      type
      groups
      settings
      data
      fields {
        id
        name
        title
        description
        type
        settings
      }
      createdAt
      updatedAt
    }
  }
`;

export default GET_SINGLETON_BY_ID_QUERY;
