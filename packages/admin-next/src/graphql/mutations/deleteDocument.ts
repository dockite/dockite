import { gql } from '@apollo/client/core';

export interface DeleteDocumentMutationResponse {
  deleteDocument: boolean;
}

export interface DeleteDocumentMutationVariables {
  input: {
    id: string;
  };
}

export const DELETE_DOCUMENT_MUTATION = gql`
  mutation DeleteDocument($input: DeleteDocumentArgs!) {
    deleteDocument(input: $input)
  }
`;
