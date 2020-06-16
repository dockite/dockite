import { ActionTree, GetterTree, MutationTree } from 'vuex';

import { RootState } from '.';

import {
  RestoreDocumentRevisionMutationResponse,
  RestoreSchemaRevisionMutationResponse,
} from '~/common/types';
import RestoreDocumentRevisionMutation from '~/graphql/mutations/restore-document-revision.gql';
import RestoreSchemaRevisionMutation from '~/graphql/mutations/restore-schema-revision.gql';
import * as data from '~/store/data';

export interface RevisionState {
  errors: string | string[] | null;
}

interface RestoreRevisionPayload {
  revisionId: string;
}

export interface RestoreDocumentRevisionPayload extends RestoreRevisionPayload {
  documentId: string;
}

export interface RestoreSchemaRevisionPayload extends RestoreRevisionPayload {
  schemaId: string;
}

export const namespace = 'revision';

export const state = (): RevisionState => ({
  errors: null,
});

export const getters: GetterTree<RevisionState, RootState> = {};

export const actions: ActionTree<RevisionState, RootState> = {
  async restoreDocumentRevision(_, payload: RestoreDocumentRevisionPayload): Promise<void> {
    const { data: revisionData } = await this.$apolloClient.mutate<
      RestoreDocumentRevisionMutationResponse
    >({
      mutation: RestoreDocumentRevisionMutation,
      variables: {
        revisionId: payload.revisionId,
        documentId: payload.documentId,
      },
      update: () => {
        this.$apolloClient.resetStore();
      },
    });

    this.commit(`${data.namespace}/removeDocument`, payload.documentId);

    if (!revisionData?.restoreDocumentRevision) {
      throw new Error('Unable to restore document revision');
    }
  },

  async restoreSchemaRevision(_, payload: RestoreSchemaRevisionPayload): Promise<void> {
    const { data: revisionData } = await this.$apolloClient.mutate<
      RestoreSchemaRevisionMutationResponse
    >({
      mutation: RestoreSchemaRevisionMutation,
      variables: {
        revisionId: payload.revisionId,
        schemaId: payload.schemaId,
      },
      update: () => {
        this.$apolloClient.resetStore();
      },
    });

    this.commit(`${data.namespace}/removeSchemaWithFields`, payload.schemaId);

    if (!revisionData?.restoreSchemaRevision) {
      throw new Error('Unable to restore schema revision');
    }
  },
};

export const mutations: MutationTree<RevisionState> = {
  setErrors(state, payload: string | string[]) {
    state.errors = payload;
  },

  clearErrors(state) {
    state.errors = null;
  },
};
