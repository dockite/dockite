import { Document } from '@dockite/database';
import { ActionTree, MutationTree } from 'vuex';

import { RootState } from '.';

export const namespace = 'ui';

export interface UiState {
  itemsForBulkEdit: Document[];
  itemsForBulkEditSchemaId: string | null;
}

export const state = (): UiState => ({
  itemsForBulkEdit: [],
  itemsForBulkEditSchemaId: null,
});

export const actions: ActionTree<RootState, UiState> = {};

export const mutations: MutationTree<UiState> = {
  setItemsForBulkEdit(state, payload: { schemaId: string; items: Document[] }): void {
    state.itemsForBulkEdit = payload.items;
    state.itemsForBulkEditSchemaId = payload.schemaId;
  },

  clearItemsForBulkEdit(state): void {
    state.itemsForBulkEditSchemaId = null;
    state.itemsForBulkEdit = [];
  },
};
