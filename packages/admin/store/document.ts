import { ActionTree, GetterTree, MutationTree } from 'vuex';

import { RootState } from '.';

import {
  CreateDocumentMutationResponse,
  DeleteDocumentMutationResponse,
  UpdateDocumentMutationResponse,
} from '~/common/types';
import CreateDocumentMutation from '~/graphql/mutations/create-document.gql';
import DeleteDocumentMutation from '~/graphql/mutations/delete-document.gql';
import UpdateDocumentMutation from '~/graphql/mutations/update-document.gql';
import AllDocumentsWithSchemaQuery from '~/graphql/queries/all-documents-with-schema.gql';
import FindDocumentsBySchemaIdQuery from '~/graphql/queries/find-documents-by-schema-id.gql';
import * as data from '~/store/data';

export interface DocumentState {
  errors: null | string | string[];
}

interface CreateDocumentPayload {
  data: Record<string, any>;
  schemaId: string;
}

interface UpdateDocumentPayload extends CreateDocumentPayload {
  documentId: string;
}

type DeleteDocumentPayload = Omit<UpdateDocumentPayload, 'data'>;

export const namespace = 'document';

export const state = (): DocumentState => ({
  errors: null,
});

const DEFAULT_LOCALE = 'en-AU';

export const getters: GetterTree<DocumentState, RootState> = {};

export const actions: ActionTree<DocumentState, RootState> = {
  async createDocument(_, payload: CreateDocumentPayload): Promise<void> {
    const { data } = await this.$apolloClient.mutate<CreateDocumentMutationResponse>({
      mutation: CreateDocumentMutation,
      variables: {
        schemaId: payload.schemaId,
        data: payload.data,
        locale: DEFAULT_LOCALE,
      },
      refetchQueries: [
        { query: AllDocumentsWithSchemaQuery },
        { query: FindDocumentsBySchemaIdQuery, variables: { id: payload.schemaId } },
      ],
    });

    if (!data?.createDocument) {
      throw new Error('Unable to create document');
    }
  },

  async updateDocument(_, payload: UpdateDocumentPayload): Promise<void> {
    const { data: documentData } = await this.$apolloClient.mutate<UpdateDocumentMutationResponse>({
      mutation: UpdateDocumentMutation,
      variables: {
        id: payload.documentId,
        data: payload.data,
        locale: DEFAULT_LOCALE,
      },
      refetchQueries: [
        { query: AllDocumentsWithSchemaQuery },
        { query: FindDocumentsBySchemaIdQuery, variables: { id: payload.schemaId } },
      ],
    });

    if (!documentData?.updateDocument) {
      throw new Error('Unable to update document');
    }

    this.commit(`${data.namespace}/removeDocument`, payload.documentId);
  },

  async deleteDocument(_, payload: DeleteDocumentPayload): Promise<void> {
    const { data } = await this.$apolloClient.mutate<DeleteDocumentMutationResponse>({
      mutation: DeleteDocumentMutation,
      variables: {
        id: payload.documentId,
      },
      refetchQueries: [
        { query: AllDocumentsWithSchemaQuery },
        { query: FindDocumentsBySchemaIdQuery, variables: { id: payload.schemaId } },
      ],
    });

    if (!data?.removeDocument) {
      throw new Error('Unable to delete document');
    }
  },
};

export const mutations: MutationTree<DocumentState> = {
  setErrors(state, payload: string | string[]) {
    state.errors = payload;
  },

  clearErrors(state) {
    state.errors = null;
  },
};
