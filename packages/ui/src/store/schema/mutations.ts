import { MutationTree } from 'vuex';

import { SchemaState } from './types';

export const mutations: MutationTree<SchemaState> = {
  setSchemaId(state, schemaId: string) {
    state.schemaId = schemaId;
  },
};
