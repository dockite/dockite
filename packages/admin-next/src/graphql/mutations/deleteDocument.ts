import { gql } from '@apollo/client/core';

export interface DeleteDocumentMutationResponse {
  deleteDocument: boolean;
}

export interface DeleteDocumentMutationVariables {
  id: string;
}

export const DELETE_DOCUMENT_MUTATION = gql`
  mutation DeleteDocument($id: String!) {
    deleteDocument: removeDocument(id: $id)
  }
`;
