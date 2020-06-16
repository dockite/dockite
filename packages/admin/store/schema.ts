import { Field, Schema, SchemaType } from '@dockite/types';
import { ActionTree, GetterTree, MutationTree } from 'vuex';

import { RootState } from '.';

import {
  CreateFieldMutationResponse,
  CreateSchemaMutationResponse,
  DeleteFieldMutationResponse,
  DeleteSchemaMutationResponse,
  UnpersistedField,
  UpdateSchemaMutationResponse,
} from '~/common/types';
import CreateFieldMutation from '~/graphql/mutations/create-field.gql';
import CreateSchemaMutation from '~/graphql/mutations/create-schema.gql';
import DeleteFieldMutation from '~/graphql/mutations/delete-field.gql';
import DeleteSchemaMutation from '~/graphql/mutations/delete-schema.gql';
import UpdateFieldMutation from '~/graphql/mutations/update-field.gql';
import UpdateSchemaMutation from '~/graphql/mutations/update-schema.gql';
import AllSchemasQuery from '~/graphql/queries/all-schemas.gql';
import * as data from '~/store/data';

export interface SchemaState {
  errors: null | string | string[];
}

interface CreateSchemaWithFields {
  name: string;
  fields: UnpersistedField[];
  groups: Record<string, string[]>;
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
    const { data: schemaData } = await this.$apolloClient.mutate<CreateSchemaMutationResponse>({
      mutation: CreateSchemaMutation,
      variables: {
        name: payload.name,
        type: SchemaType.DEFAULT,
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

  async updateSchemaAndFields(_, payload: UpdateSchemaAndFieldsPayload) {
    // const { fields }: Schema = this.getters(`${data.namespace}/getSchemaWithFieldsById`)(
    //   payload.schema.id,
    // );

    const { data: schemaData } = await this.$apolloClient.mutate<UpdateSchemaMutationResponse>({
      mutation: UpdateSchemaMutation,
      variables: {
        ...payload.schema,
      },
    });

    if (!schemaData?.updateSchema) {
      throw new Error('Unable to create schema');
    }

    const deleteFieldsPromises = payload.deletedFields.map(id =>
      this.$apolloClient.mutate<DeleteFieldMutationResponse>({
        mutation: DeleteFieldMutation,
        variables: { id },
      }),
    );

    const updateFieldsPromises = payload.fields
      .filter(field => (field.id ?? null) !== null)
      .map(field =>
        this.$apolloClient.mutate({
          mutation: UpdateFieldMutation,
          variables: {
            ...field,
          },
        }),
      );

    const createFieldsPromises = payload.fields
      .filter(field => (field.id ?? null) === null)
      .map(field =>
        this.$apolloClient.mutate({
          mutation: CreateFieldMutation,
          variables: {
            ...field,
            schemaId: payload.schema.id,
          },
        }),
      );

    await Promise.all([...deleteFieldsPromises, ...updateFieldsPromises, ...createFieldsPromises]);
    this.$apolloClient.resetStore();

    this.commit(`${data.namespace}/removeSchemaWithFields`, payload.schema.id);
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
};

export const mutations: MutationTree<SchemaState> = {
  setErrors(state, payload: string | string[]) {
    state.errors = payload;
  },

  clearErrors(state) {
    state.errors = null;
  },
};
