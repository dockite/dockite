import { Document } from '@dockite/database';
import { ActionTree, MutationTree } from 'vuex';

import { RootState } from '.';

export const namespace = 'ui';

export interface UiState {
  itemsForBulkEdit: Document[];
}

export const state = (): UiState => ({
  itemsForBulkEdit: [],
});

export const actions: ActionTree<RootState, UiState> = {};

export const mutations: MutationTree<UiState> = {
  setItemsForBulkEdit(state, payload: Document[]): void {
    state.itemsForBulkEdit = payload;
  },

  clearItemsForBulkEdit(state): void {
    state.itemsForBulkEdit = [];
  },
};
