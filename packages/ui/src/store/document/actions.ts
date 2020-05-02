import { gql } from 'apollo-boost';
import { ActionTree } from 'vuex';

import { apolloClient } from '@/apollo';

import { DocumentState, CreateDocumentPayload, UpdateDocumentPayload } from './types';

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

  async update({ commit }, payload: UpdateDocumentPayload) {
    const { data } = await apolloClient.mutate<{ updateDocument: { id: string } }>({
      mutation: gql`
        mutation($id: String!, $data: JSON!) {
          updateDocument(id: $id, data: $data) {
            id
          }
        }
      `,
      variables: { id: payload.id ?? '', data: payload.data },
    });

    if (!data) throw Error('Mutation failed');

    commit('setDocumentId', data.updateDocument.id);
  },

  async delete({ commit }, documentId: string) {
    await apolloClient.mutate({
      mutation: gql`
        mutation($id: String!) {
          removeDocument(id: $id)
        }
      `,

      variables: { id: documentId },
    });

    commit('setDocumentId', null);
  },
};
