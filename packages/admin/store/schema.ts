import { Field, Schema } from '@dockite/database';
import { ActionTree, GetterTree, MutationTree } from 'vuex';

import { RootState } from '.';

import {
  DeleteSchemaMutationResponse,
  ImportSchemaMutationResponse,
  UnpersistedField,
} from '~/common/types';
import DeleteSchemaMutation from '~/graphql/mutations/delete-schema.gql';
import ImportSchemaMutation from '~/graphql/mutations/import-schema.gql';
import * as data from '~/store/data';

export interface SchemaState {
  errors: null | string | string[];
}

interface CreateSchemaWithFields {
  name: string;
  title: string;
  fields: UnpersistedField[];
  groups: Record<string, string[]>;
  settings: Record<string, any>;
}

interface UpdateSchemaAndFieldsPayload {
  schema: Schema;
  fields: Field[];
  deletedFields: string[];
}

export const namespace = 'schema';

export const state = (): SchemaState => ({
  errors: null,
});

export const getters: GetterTree<SchemaState, RootState> = {};

export const actions: ActionTree<SchemaState, RootState> = {
  async createSchemaWithFields(_, payload: CreateSchemaWithFields): Promise<void> {
    const { data: schemaData } = await this.$apolloClient.mutate<ImportSchemaMutationResponse>({
      mutation: ImportSchemaMutation,
      variables: {
        schemaId: null,
        payload: JSON.stringify({
          ...payload,
          groups: Object.keys(payload.groups).map(key => ({ [key]: payload.groups[key] })),
        }),
      },
      update: () => {
        this.$apolloClient.resetStore();
      },
    });

    if (!schemaData?.importSchema) {
      throw new Error('Unable to delete schema');
    }

    await this.dispatch(`${data.namespace}/fetchAllSchemas`, true);
  },

  async updateSchemaAndFields(_, payload: UpdateSchemaAndFieldsPayload) {
    const { data: schemaData } = await this.$apolloClient.mutate<ImportSchemaMutationResponse>({
      mutation: ImportSchemaMutation,
      variables: {
        schemaId: payload.schema.id ?? null,
        payload: JSON.stringify({
          ...payload.schema,
          groups: Object.keys(payload.schema.groups).map(key => ({
            [key]: payload.schema.groups[key],
          })),
          fields: payload.fields,
        }),
      },
      update: () => {
        this.$apolloClient.resetStore();
      },
    });

    if (!schemaData?.importSchema) {
      throw new Error('Unable to delete schema');
    }

    await this.dispatch(`${data.namespace}/fetchAllSchemas`, true);
  },

  async deleteSchema(_, payload: string) {
    const { data: schemaData } = await this.$apolloClient.mutate<DeleteSchemaMutationResponse>({
      mutation: DeleteSchemaMutation,
      variables: {
        id: payload,
      },
      update: () => {
        this.$apolloClient.resetStore();
      },
    });

    if (!schemaData?.removeSchema) {
      throw new Error('Unable to delete schema');
    }

    await this.dispatch(`${data.namespace}/fetchAllSchemas`, true);
    this.commit(`${data.namespace}/removeSchemaWithFields`, payload);
  },

  async importSchema(_, payload: { schemaId?: string; payload: string }) {
    const { data: schemaData } = await this.$apolloClient.mutate<ImportSchemaMutationResponse>({
      mutation: ImportSchemaMutation,
      variables: {
        schemaId: payload.schemaId ?? null,
        payload: payload.payload,
      },
      update: () => {
        this.$apolloClient.resetStore();
      },
    });

    if (!schemaData?.importSchema) {
      throw new Error('Unable to delete schema');
    }

    await this.dispatch(`${data.namespace}/fetchAllSchemas`, true);
  },
};

export const mutations: MutationTree<SchemaState> = {
  setErrors(state, payload: string | string[]) {
    state.errors = payload;
  },

  clearErrors(state) {
    state.errors = null;
  },
};
