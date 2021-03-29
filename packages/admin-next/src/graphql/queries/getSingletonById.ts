import { gql } from '@apollo/client/core';

import { Singleton } from '@dockite/database';

export interface GetSingletonByIdQueryResponse {
  getSingleton: Singleton;
}

export interface GetSingletonByIdQueryVariables {
  id: string;
  locale?: string;
  deleted?: boolean;
}

export const GET_SINGLETON_BY_ID_QUERY = gql`
  query GetSingletonById($id: String!, $locale: String, $deleted: Boolean = false) {
    getSingleton(id: $id, locale: $locale, deleted: $deleted) {
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
