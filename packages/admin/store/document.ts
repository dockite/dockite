import { ActionTree, GetterTree, MutationTree } from 'vuex';

import { RootState } from '.';

import {
  CreateDocumentMutationResponse,
  DeleteDocumentMutationResponse,
  UpdateDocumentMutationResponse,
  PartialUpdateDocumentsInSchemaIdMutationResponse,
} from '~/common/types';
import CreateDocumentMutation from '~/graphql/mutations/create-document.gql';
import DeleteDocumentMutation from '~/graphql/mutations/delete-document.gql';
import PartialUpdateDocumentsInSchemaIdMutation from '~/graphql/mutations/partial-update-documents-in-schema-id.gql';
import UpdateDocumentMutation from '~/graphql/mutations/update-document.gql';
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

interface PartialUpdateDocumentsInSchemaIdPayload extends CreateDocumentPayload {
  documentIds?: string[];
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
    const { data: createDocumentData } = await this.$apolloClient.mutate<
      CreateDocumentMutationResponse
    >({
      mutation: CreateDocumentMutation,
      variables: {
        schemaId: payload.schemaId,
        data: payload.data,
        locale: DEFAULT_LOCALE,
      },
      update: () => {
        this.$apolloClient.resetStore();
      },
    });

    if (!createDocumentData?.createDocument) {
      throw new Error('Unable to create document');
    }

    this.commit(`${data.namespace}/clearDocumentData`);
  },

  async updateDocument(_, payload: UpdateDocumentPayload): Promise<void> {
    const { data: documentData } = await this.$apolloClient.mutate<UpdateDocumentMutationResponse>({
      mutation: UpdateDocumentMutation,
      variables: {
        id: payload.documentId,
        data: payload.data,
        locale: DEFAULT_LOCALE,
      },
    });

    if (!documentData?.updateDocument) {
      throw new Error('Unable to update document');
    }

    this.commit(`${data.namespace}/removeDocument`, payload.documentId);
  },

  async partialUpdateDocumentsInSchemaId(
    _,
    payload: PartialUpdateDocumentsInSchemaIdPayload,
  ): Promise<void> {
    const { data: documentData } = await this.$apolloClient.mutate<
      PartialUpdateDocumentsInSchemaIdMutationResponse
    >({
      mutation: PartialUpdateDocumentsInSchemaIdMutation,
      variables: {
        schemaId: payload.schemaId,
        data: payload.data,
        documentIds: payload.documentIds,
      },
      update: () => {
        this.$apolloClient.resetStore();
      },
    });

    if (!documentData?.partialUpdateDocumentsInSchemaId) {
      throw new Error('Unable to update document');
    }

    this.commit(`${data.namespace}/clearDocumentData`);
  },

  async deleteDocument(_, payload: DeleteDocumentPayload): Promise<void> {
    const { data } = await this.$apolloClient.mutate<DeleteDocumentMutationResponse>({
      mutation: DeleteDocumentMutation,
      variables: {
        id: payload.documentId,
      },
      // TODO: Update to cache eviction with @apollo/client 3.0.0
      update: () => {
        this.$apolloClient.resetStore();
      },
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
