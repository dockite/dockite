import { gql } from '@apollo/client/core';

export interface PermanentlyDeleteDocumentMutationResponse {
  permanentlyDeleteDocument: boolean;
}

export interface PermanentlyDeleteDocumentMutationVariables {
  input: {
    id: string;
  };
}

export const PERMANENTLY_DELETE_DOCUMENT_MUTATION = gql`
  mutation PermanentlyDeleteDocument($input: PermanentlyDeleteDocumentArgs!) {
    permanentlyDeleteDocument(input: $input)
  }
`;
