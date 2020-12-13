import { ActionTree, GetterTree, MutationTree } from 'vuex';

import { RootState } from '.';

import {
  CreateDraftMutationResponse,
  DeleteDraftMutationResponse,
  PermanentlyDeleteDraftMutationResponse,
  UpdateDraftMutationResponse,
} from '~/common/types';
import CreateDraftMutation from '~/graphql/mutations/create-draft.gql';
import DeleteDraftMutation from '~/graphql/mutations/delete-draft.gql';
import PermanentlyDeleteDraftMutation from '~/graphql/mutations/permanently-delete-draft.gql';
import UpdateDraftMutation from '~/graphql/mutations/update-draft.gql';
import * as data from '~/store/data';

export interface DraftState {
  errors: null | string | string[];
}

interface CreateDraftPayload {
  name: string;
  data: Record<string, any>;
  documentId: string;
  schemaId: string;
}

interface UpdateDraftPayload {
  draftId: string;
  name?: string;
  data: Record<string, any>;
}

type DeleteDraftPayload = Omit<UpdateDraftPayload, 'data'>;

export const namespace = 'draft';

export const state = (): DraftState => ({
  errors: null,
});

const DEFAULT_LOCALE = 'en-AU';

export const getters: GetterTree<DraftState, RootState> = {};

export const actions: ActionTree<DraftState, RootState> = {
  async createDraft(_, payload: CreateDraftPayload): Promise<void> {
    const { data: createDraftData } = await this.$apolloClient.mutate<CreateDraftMutationResponse>({
      mutation: CreateDraftMutation,
      variables: {
        name: payload.name,
        documentId: payload.documentId,
        schemaId: payload.schemaId,
        data: payload.data,
        locale: DEFAULT_LOCALE,
      },
      update: () => {
        this.$apolloClient.resetStore();
      },
    });

    if (!createDraftData?.createDraft) {
      throw new Error('Unable to create draft');
    }

    this.commit(`${data.namespace}/clearDraftData`);
  },

  async updateDraft(_, payload: UpdateDraftPayload): Promise<void> {
    const { data: draftData } = await this.$apolloClient.mutate<UpdateDraftMutationResponse>({
      mutation: UpdateDraftMutation,
      variables: {
        id: payload.draftId,
        name: payload.name,
        data: payload.data,
        locale: DEFAULT_LOCALE,
      },
    });

    if (!draftData?.updateDraft) {
      throw new Error('Unable to update draft');
    }

    this.commit(`${data.namespace}/clearDraftData`, payload.draftId);
  },

  async deleteDraft(_, payload: DeleteDraftPayload): Promise<void> {
    const { data } = await this.$apolloClient.mutate<DeleteDraftMutationResponse>({
      mutation: DeleteDraftMutation,
      variables: {
        id: payload.draftId,
      },
      // TODO: Update to cache eviction with @apollo/client 3.0.0
      update: () => {
        this.$apolloClient.resetStore();
      },
    });

    if (!data?.removeDraft) {
      throw new Error('Unable to delete draft');
    }
  },

  async permanentlyDeleteDraft(_, payload: DeleteDraftPayload): Promise<void> {
    const { data } = await this.$apolloClient.mutate<PermanentlyDeleteDraftMutationResponse>({
      mutation: PermanentlyDeleteDraftMutation,
      variables: {
        id: payload.draftId,
      },
      // TODO: Update to cache eviction with @apollo/client 3.0.0
      update: () => {
        this.$apolloClient.resetStore();
      },
    });

    if (!data?.permanentlyRemoveDraft) {
      throw new Error('Unable to delete draft');
    }
  },
};

export const mutations: MutationTree<DraftState> = {
  setErrors(state, payload: string | string[]) {
    state.errors = payload;
  },

  clearErrors(state) {
    state.errors = null;
  },
};
