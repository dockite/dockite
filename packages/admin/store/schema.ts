import { ActionTree, GetterTree, MutationTree } from 'vuex';
import { Field, SchemaType } from '@dockite/types';

import { RootState } from '.';

import CreateSchemaMutation from '~/graphql/mutations/create-schema.gql';
import CreateFieldMutation from '~/graphql/mutations/create-field.gql';
import AllSchemasQuery from '~/graphql/queries/all-schemas.gql';
import * as data from '~/store/data';
import { CreateSchemaMutationResponse, CreateFieldMutationResponse } from '~/common/types';

export interface SchemaState {
  errors: null | string | string[];
}

interface CreateSchemaWithFields {
  name: string;
  fields: Omit<Field, 'id' | 'schemaId' | 'dockiteField' | 'schema'>[];
  groups: Record<string, string[]>;
}

export const namespace = 'schema';

export const state = () => ({
  errors: null,
});

export const getters: GetterTree<SchemaState, RootState> = {};

export const actions: ActionTree<SchemaState, RootState> = {
  async createSchemaWithFields(_, payload: CreateSchemaWithFields): Promise<void> {
    const { data: schemaData } = await this.$apolloClient.mutate<CreateSchemaMutationResponse>({
      mutation: CreateSchemaMutation,
      variables: {
        name: payload.name,
        type: SchemaType.Default,
        groups: payload.groups,
        settings: {},
      },
    });

    if (!schemaData?.createSchema) {
      throw new Error('Unable to create schema');
    }

    const schemaId = schemaData.createSchema.id;

    const createFieldPromises = payload.fields.map(field => {
      return this.$apolloClient.mutate<CreateFieldMutationResponse>({
        mutation: CreateFieldMutation,
        variables: {
          schemaId,
          name: field.name,
          type: field.type,
          title: field.title,
          description: field.description,
          settings: field.settings,
        },
        refetchQueries: [{ query: AllSchemasQuery }],
      });
    });

    await Promise.all(createFieldPromises);

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
