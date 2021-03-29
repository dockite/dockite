import { gql } from '@apollo/client/core';

import { Locale } from '@dockite/database';

export interface CreateLocaleMutationResponse {
  createLocale: Locale;
}

export interface CreateLocaleMutationVariables {
  input: {
    id: string;
    title: string;
    icon: string;
  };
}

export const CREATE_LOCALE_MUTATION = gql`
  mutation CreateLocale($input: CreateLocaleArgs!) {
    createLocale(input: $input) {
      id
      title
      icon
    }
  }
`;
