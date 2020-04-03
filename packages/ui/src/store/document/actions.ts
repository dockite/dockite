import { gql } from 'apollo-boost';
import { ActionTree } from 'vuex';

import { apolloClient } from '@/apollo';

import { DocumentState, CreateDocumentPayload } from './types';

import { RootState } from '..';

export const actions: ActionTree<DocumentState, RootState> = {
  async create({ commit }, payload: CreateDocumentPayload) {
    const { data } = await apolloClient.mutate<{ createDocument: { id: string } }>({
      mutation: gql`
        mutation CreateDocumentMutation($schemaId: String!, $data: JSON!, $locale: String!) {
          createDocument(schemaId: $schemaId, data: $data, locale: $locale) {
            id
          }
        }
      `,
      variables: { schemaId: payload.schemaId, data: payload.data, locale: payload.locale },
    });

    if (!data) throw Error('Mutation failed');

    commit('setDocumentId', data.createDocument.id);
  },
};
