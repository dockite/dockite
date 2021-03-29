import { gql } from '@apollo/client/core';

import { Locale } from '@dockite/database';

export interface GetLocaleByIdQueryResponse {
  getLocale: Locale;
}

export interface GetLocaleByIdQueryVariables {
  id: string;
}

export const GET_LOCALE_BY_ID_QUERY = gql`
  query getLocaleById($id: String!) {
    getLocale(id: $id) {
      id
      title
      icon
    }
  }
`;

export default GET_LOCALE_BY_ID_QUERY;
