import { gql } from '@apollo/client/core';

import { Locale } from '@dockite/database';

export interface UpdateLocaleMutationResponse {
  updateLocale: Locale;
}

export interface UpdateLocaleMutationVariables {
  input: {
    id: string;
    title: string;
    icon: string;
  };
}

export const UPDATE_LOCALE_MUTATION = gql`
  mutation UpdateLocale($input: UpdateLocaleArgs!) {
    updateLocale(input: $input) {
      id
      title
      icon
    }
  }
`;
