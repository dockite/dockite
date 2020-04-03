import { MutationTree } from 'vuex';

import { DocumentState } from './types';

export const mutations: MutationTree<DocumentState> = {
  setDocumentId(state, documentId: string) {
    state.documentId = documentId;
  },
};
