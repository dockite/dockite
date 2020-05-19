import { Document } from '@dockite/types';
import { DockiteFieldStatic } from '@dockite/field';
import { ActionTree, GetterTree, MutationTree } from 'vuex';

import { RootState } from '.';

import {
  AllDocumentsWithSchemaQueryResponse,
  AllDocumentsWithSchemaResultItem,
  AllSchemasQueryResponse,
  AllSchemasResultItem,
  FindDocumentResultItem,
  FindDocumentsQueryResponse,
  GetDocumentQueryResponse,
  AvailableFieldsQueryResponse,
} from '~/common/types';
import AllDocumentsWithSchemaQuery from '~/graphql/queries/all-documents-with-schema.gql';
import AllSchemasQuery from '~/graphql/queries/all-schemas.gql';
import FindDocumentsBySchemaIdQuery from '~/graphql/queries/find-documents-by-schema-id.gql';
import GetDocumentQuery from '~/graphql/queries/get-document.gql';
import AvailableFieldsQuery from '~/graphql/queries/available-fields.gql';

interface ManyResultSet<T> {
  results: T[];
  totalItems: number | null;
  totalPages: number | null;
  currentPage: number | null;
  hasNextPage: boolean | null;
}

export interface DataState {
  allSchemas: ManyResultSet<AllSchemasResultItem>;
  allDocumentsWithSchema: ManyResultSet<AllDocumentsWithSchemaResultItem>;
  getDocument: Record<string, Document>;
  findDocumentsBySchemaId: ManyResultSet<FindDocumentResultItem>;
  availableFields: DockiteFieldStatic[];
}

export const namespace = 'data';

export const state = (): DataState => ({
  allSchemas: {
    results: [],
    totalItems: null,
    totalPages: null,
    currentPage: null,
    hasNextPage: null,
  },
  allDocumentsWithSchema: {
    results: [],
    totalItems: null,
    totalPages: null,
    currentPage: null,
    hasNextPage: null,
  },
  getDocument: {},
  findDocumentsBySchemaId: {
    results: [],
    totalItems: null,
    totalPages: null,
    currentPage: null,
    hasNextPage: null,
  },
  availableFields: [],
});

export const getters: GetterTree<DataState, RootState> = {
  getDocumentById: state => (id: string): Document | null => {
    return state.getDocument[id] ?? null;
  },
  getSchemaNameById: state => (id: string): string => {
    const schema = state.allSchemas.results.find(schema => schema.id === id);

    return schema ? schema.name : '';
  },
};

export const actions: ActionTree<DataState, RootState> = {
  async fetchAllSchemas({ commit }, payload: boolean = false): Promise<void> {
    const { data } = await this.$apolloClient.query<AllSchemasQueryResponse>({
      query: AllSchemasQuery,
      fetchPolicy: payload ? 'no-cache' : 'cache-first',
    });

    if (!data.allSchemas) {
      throw new Error('graphql: allSchemas could not be fetched');
    }

    commit('setAllSchemas', data);
  },

  async fetchAllDocumentsWithSchema({ commit }): Promise<void> {
    const { data } = await this.$apolloClient.query<AllDocumentsWithSchemaQueryResponse>({
      query: AllDocumentsWithSchemaQuery,
    });

    if (!data.allDocuments) {
      throw new Error('graphql: allDocumentsWithSchema could not be fetched');
    }

    commit('setAllDocumentsWithSchema', data);
  },

  async fetchDocumentById(
    { state, commit },
    payload: { id: string; force?: boolean },
  ): Promise<void> {
    if (state.getDocument[payload.id] && !payload.force) {
      return;
    }

    const { data } = await this.$apolloClient.query<GetDocumentQueryResponse>({
      query: GetDocumentQuery,
      variables: { id: payload.id },
    });

    if (!data.getDocument) {
      throw new Error('graphql: getDocument could not be fetched');
    }

    commit('setDocument', data);
  },

  async fetchFindDocumentsBySchemaId({ commit }, payload: string): Promise<void> {
    const { data } = await this.$apolloClient.query<FindDocumentsQueryResponse>({
      query: FindDocumentsBySchemaIdQuery,
      variables: { id: payload },
    });

    if (!data.findDocuments) {
      throw new Error('graphql: allDocumentsWithSchema could not be fetched');
    }

    commit('setFindDocumentsBySchemaId', data);
  },

  async fetchAvailableFields({ commit }): Promise<void> {
    const { data } = await this.$apolloClient.query<AvailableFieldsQueryResponse>({
      query: AvailableFieldsQuery,
    });

    if (!data.availableFields) {
      throw new Error('graphql: availableFields could not be fetched');
    }

    commit('setAvailableFields', data);
  },
};

export const mutations: MutationTree<DataState> = {
  setAllSchemas(state, payload: AllSchemasQueryResponse) {
    state.allSchemas = { ...payload.allSchemas };
  },

  setAllDocumentsWithSchema(state, payload: AllDocumentsWithSchemaQueryResponse): void {
    state.allDocumentsWithSchema = { ...payload.allDocuments };
  },

  setDocument(state, payload: GetDocumentQueryResponse) {
    state.getDocument = {
      ...state.getDocument,
      [payload.getDocument.id]: {
        ...payload.getDocument,
      },
    };
  },

  setFindDocumentsBySchemaId(state, payload: FindDocumentsQueryResponse): void {
    state.findDocumentsBySchemaId = { ...payload.findDocuments };
  },

  setAvailableFields(state, payload: AvailableFieldsQueryResponse): void {
    state.availableFields = payload.availableFields;
  },
};
