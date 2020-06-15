import { DockiteFieldStatic, Document, Schema } from '@dockite/types';
import Vue from 'vue';
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
  GetSchemaWithFieldsQueryResponse,
  ManyResultSet,
  AllWebhooksQueryResponse,
  AllWebhooksResultItem,
  FindWebhookCallsQueryResponse,
  FindWebhookCallsResultItem,
  SearchDocumentsWithSchemaResultItem,
  SearchDocumentsWithSchemaQueryResponse,
  AllSchemaRevisionsResultItem,
  AllSchemaRevisionsQueryResponse,
} from '~/common/types';
import AllDocumentsWithSchemaQuery from '~/graphql/queries/all-documents-with-schema.gql';
import AllSchemaRevisionsQuery from '~/graphql/queries/all-schema-revisions.gql';
import AllSchemasQuery from '~/graphql/queries/all-schemas.gql';
import AllWebhooksQuery from '~/graphql/queries/all-webhooks.gql';
import AvailableFieldsQuery from '~/graphql/queries/available-fields.gql';
import FindDocumentsBySchemaIdQuery from '~/graphql/queries/find-documents-by-schema-id.gql';
import FindWebhookCallsByWebhookIdQuery from '~/graphql/queries/find-webhook-calls-by-webhook-id.gql';
import GetDocumentQuery from '~/graphql/queries/get-document.gql';
import GetSchemaWithFieldsQuery from '~/graphql/queries/get-schema-with-fields.gql';
import SearchDocumentsWithSchemaQuery from '~/graphql/queries/search-documents-with-schema.gql';

export interface DataState {
  allSchemas: ManyResultSet<AllSchemasResultItem>;
  allSchemaRevisions: ManyResultSet<AllSchemaRevisionsResultItem>;
  allWebhooks: ManyResultSet<AllWebhooksResultItem>;
  allDocumentsWithSchema: ManyResultSet<AllDocumentsWithSchemaResultItem>;
  searchDocumentsWithSchema: ManyResultSet<SearchDocumentsWithSchemaResultItem>;
  getDocument: Record<string, Document>;
  getSchemaWithFields: Record<string, Schema>;
  findDocumentsBySchemaId: ManyResultSet<FindDocumentResultItem>;
  availableFields: DockiteFieldStatic[];
  findWebhookCallsByWebhookId: ManyResultSet<FindWebhookCallsResultItem>;
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
  allWebhooks: {
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
  allSchemaRevisions: {
    results: [],
    totalItems: null,
    totalPages: null,
    currentPage: null,
    hasNextPage: null,
  },
  searchDocumentsWithSchema: {
    results: [],
    totalItems: null,
    totalPages: null,
    currentPage: null,
    hasNextPage: null,
  },
  getDocument: {},
  getSchemaWithFields: {},
  findDocumentsBySchemaId: {
    results: [],
    totalItems: null,
    totalPages: null,
    currentPage: null,
    hasNextPage: null,
  },
  availableFields: [],
  findWebhookCallsByWebhookId: {
    results: [],
    totalItems: null,
    totalPages: null,
    currentPage: null,
    hasNextPage: null,
  },
});

export const getters: GetterTree<DataState, RootState> = {
  getDocumentById: state => (id: string): Document | null => {
    return state.getDocument[id] ?? null;
  },

  getSchemaNameById: state => (id: string): string => {
    const schema = state.allSchemas.results.find(schema => schema.id === id);

    return schema ? schema.name : '';
  },

  getSchemaWithFieldsById: state => (id: string): Schema | null => {
    const schema = state.getSchemaWithFields[id];

    return schema ?? null;
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

  async fetchAllDocumentsWithSchema({ commit }, payload = 1): Promise<void> {
    const { data } = await this.$apolloClient.query<AllDocumentsWithSchemaQueryResponse>({
      query: AllDocumentsWithSchemaQuery,
      variables: { page: payload },
    });

    if (!data.allDocuments) {
      throw new Error('graphql: allDocumentsWithSchema could not be fetched');
    }

    commit('setAllDocumentsWithSchema', data);
  },

  async fetchAllSchemaRevisionsForSchema(
    { commit },
    payload: { schemaId: string; perPage?: Number },
  ): Promise<void> {
    const { data } = await this.$apolloClient.query<AllSchemaRevisionsQueryResponse>({
      query: AllSchemaRevisionsQuery,
      variables: {
        schemaId: payload.schemaId,
        perPage: payload.perPage ?? null,
      },
    });

    if (!data.allSchemaRevisions) {
      throw new Error('graphql: allSchemaRevisions could not be fetched');
    }

    commit('setAllSchemaRevisionsForSchema', data);
  },

  async fetchSearchDocumentsWithSchema(
    { commit },
    payload: { term: string; schemaId?: string; page?: number },
  ): Promise<void> {
    const { data } = await this.$apolloClient.query<SearchDocumentsWithSchemaQueryResponse>({
      query: SearchDocumentsWithSchemaQuery,
      variables: { ...payload },
    });

    if (!data.searchDocuments) {
      throw new Error('graphql: searchDocumentsWithSchema could not be fetched');
    }

    commit('setSearchDocumentsWithSchema', data);
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

  async fetchSchemaWithFieldsById(
    { state, commit },
    payload: { id: string; force?: boolean },
  ): Promise<void> {
    if (state.getSchemaWithFields[payload.id] && !payload.force) {
      return;
    }

    const { data } = await this.$apolloClient.query<GetSchemaWithFieldsQueryResponse>({
      query: GetSchemaWithFieldsQuery,
      variables: { id: payload.id },
    });

    if (!data.getSchema) {
      throw new Error('graphql: getSchema could not be fetched');
    }

    commit('setSchemaWithFields', data);
  },

  async fetchFindDocumentsBySchemaId(
    { commit },
    payload: { schemaId: string; page?: number },
  ): Promise<void> {
    const { data } = await this.$apolloClient.query<FindDocumentsQueryResponse>({
      query: FindDocumentsBySchemaIdQuery,
      variables: { id: payload.schemaId, page: payload.page ?? 1 },
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

  async fetchAllWebhooks({ commit }): Promise<void> {
    const { data } = await this.$apolloClient.query<AllWebhooksQueryResponse>({
      query: AllWebhooksQuery,
    });

    if (!data.allWebhooks) {
      throw new Error('graphql: allWebhooks could not be fetched');
    }

    commit('setAllWebhooks', data);
  },

  async fetchFindWebhookCallsByWebhookId(
    { commit },
    payload: { webhookId: string; page?: number },
  ): Promise<void> {
    const { data } = await this.$apolloClient.query<FindWebhookCallsQueryResponse>({
      query: FindWebhookCallsByWebhookIdQuery,
      variables: { id: payload.webhookId, page: payload.page ?? 1 },
    });

    if (!data.findWebhookCalls) {
      throw new Error('graphql: findWebhookCalls could not be fetched');
    }

    commit('setFindWebhookCallsByWebhookId', data);
  },
};

export const mutations: MutationTree<DataState> = {
  setAllSchemas(state, payload: AllSchemasQueryResponse) {
    state.allSchemas = { ...payload.allSchemas };
  },

  setAllSchemaRevisionsForSchema(state, payload: AllSchemaRevisionsQueryResponse): void {
    state.allSchemaRevisions = { ...payload.allSchemaRevisions };
  },

  setAllDocumentsWithSchema(state, payload: AllDocumentsWithSchemaQueryResponse): void {
    state.allDocumentsWithSchema = { ...payload.allDocuments };
  },

  setSearchDocumentsWithSchema(state, payload: SearchDocumentsWithSchemaQueryResponse): void {
    state.searchDocumentsWithSchema = { ...payload.searchDocuments };
  },

  setDocument(state, payload: GetDocumentQueryResponse) {
    state.getDocument = {
      ...state.getDocument,
      [payload.getDocument.id]: {
        ...payload.getDocument,
      },
    };
  },

  setSchemaWithFields(state, payload: GetSchemaWithFieldsQueryResponse): void {
    state.getSchemaWithFields = {
      ...state.getSchemaWithFields,
      [payload.getSchema.id]: {
        ...payload.getSchema,
      },
    };
  },

  removeSchemaWithFields(state, payload: string): void {
    Vue.delete(state.getSchemaWithFields, payload);
  },

  removeDocument(state, payload: string): void {
    Vue.delete(state.getDocument, payload);
  },

  setFindDocumentsBySchemaId(state, payload: FindDocumentsQueryResponse): void {
    state.findDocumentsBySchemaId = { ...payload.findDocuments };
  },

  setAvailableFields(state, payload: AvailableFieldsQueryResponse): void {
    state.availableFields = payload.availableFields;
  },

  setAllWebhooks(state, payload: AllWebhooksQueryResponse) {
    state.allWebhooks = { ...payload.allWebhooks };
  },

  setFindWebhookCallsByWebhookId(state, payload: FindWebhookCallsQueryResponse): void {
    state.findWebhookCallsByWebhookId = { ...payload.findWebhookCalls };
  },
};
