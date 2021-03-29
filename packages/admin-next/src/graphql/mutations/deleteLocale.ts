import { gql } from '@apollo/client/core';

export interface DeleteLocaleMutationResponse {
  deleteLocale: boolean;
}

export interface DeleteLocaleMutationVariables {
  input: {
    id: string;
  };
}

export const DELETE_LOCALE_MUTATION = gql`
  mutation DeleteLocale($input: DeleteLocaleArgs!) {
    deleteLocale(input: $input)
  }
`;
