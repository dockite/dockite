import { gql } from '@apollo/client/core';

export interface RestoreDocumentMutationResponse {
  restoreDocument: boolean;
}

export interface RestoreDocumentMutationVariables {
  input: {
    id: string;
  };
}

export const RESTORE_DOCUMENT_MUTATION = gql`
  mutation RestoreDocument($input: RestoreDocumentArgs!) {
    restoreDocument(input: $input)
  }
`;
