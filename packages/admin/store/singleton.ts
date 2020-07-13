import { Field, Singleton, SchemaType } from '@dockite/database';
import { ActionTree, GetterTree, MutationTree } from 'vuex';

import { RootState } from '.';

import {
  CreateFieldMutationResponse,
  CreateSingletonMutationResponse,
  DeleteFieldMutationResponse,
  DeleteSingletonMutationResponse,
  UnpersistedField,
  UpdateSingletonMutationResponse,
  ImportSingletonMutationResponse,
} from '~/common/types';
import CreateFieldMutation from '~/graphql/mutations/create-field.gql';
import CreateSingletonMutation from '~/graphql/mutations/create-singleton.gql';
import DeleteFieldMutation from '~/graphql/mutations/delete-field.gql';
import DeleteSingletonMutation from '~/graphql/mutations/delete-singleton.gql';
import ImportSingletonMutation from '~/graphql/mutations/import-singleton.gql';
import UpdateFieldMutation from '~/graphql/mutations/update-field.gql';
import UpdateSingletonMutation from '~/graphql/mutations/update-singleton.gql';
import AllSingletonsQuery from '~/graphql/queries/all-singletons.gql';
import * as data from '~/store/data';

export interface SingletonState {
  errors: null | string | string[];
}

interface CreateSingletonWithFields {
  name: string;
  title: string;
  fields: UnpersistedField[];
  groups: Record<string, string[]>;
  data: Record<string, string[]>;
  settings: Record<string, any>;
}

interface UpdateSingletonAndFieldsPayload {
  singleton: Singleton;
  fields: Field[];
  deletedFields: string[];
}

export const namespace = 'singleton';

export const state = (): SingletonState => ({
  errors: null,
});

export const getters: GetterTree<SingletonState, RootState> = {};

export const actions: ActionTree<SingletonState, RootState> = {
  async createSingletonWithFields(_, payload: CreateSingletonWithFields): Promise<void> {
    const { data: singletonData } = await this.$apolloClient.mutate<
      CreateSingletonMutationResponse
    >({
      mutation: CreateSingletonMutation,
      variables: {
        name: payload.name,
        title: payload.title,
        type: SchemaType.SINGLETON,
        groups: payload.groups,
        data: payload.data,
        settings: payload.settings,
      },
    });

    if (!singletonData?.createSingleton) {
      throw new Error('Unable to create singleton');
    }

    const schemaId = singletonData.createSingleton.id;

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
        refetchQueries: [{ query: AllSingletonsQuery }],
      });
    });

    await Promise.all(createFieldPromises);

    await this.dispatch(`${data.namespace}/fetchAllSingletons`, true);
  },

  async updateSingletonAndFields(_, payload: UpdateSingletonAndFieldsPayload) {
    // const { fields }: Singleton = this.getters(`${data.namespace}/getSingletonWithFieldsById`)(
    //   payload.singleton.id,
    // );

    const { data: singletonData } = await this.$apolloClient.mutate<
      UpdateSingletonMutationResponse
    >({
      mutation: UpdateSingletonMutation,
      variables: {
        ...payload.singleton,
      },
    });

    if (!singletonData?.updateSingleton) {
      throw new Error('Unable to create singleton');
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
            schemaId: payload.singleton.id,
          },
        }),
      );

    await Promise.all([...deleteFieldsPromises, ...updateFieldsPromises, ...createFieldsPromises]);
    await this.$apolloClient.resetStore();

    this.commit(`${data.namespace}/removeSingletonWithFields`, payload.singleton.id);
    this.dispatch(`${data.namespace}/fetchSingletonWithFieldsById`, { id: payload.singleton.id });
  },

  async deleteSingleton(_, payload: string) {
    const { data: singletonData } = await this.$apolloClient.mutate<
      DeleteSingletonMutationResponse
    >({
      mutation: DeleteSingletonMutation,
      variables: {
        id: payload,
      },
      update: () => {
        this.$apolloClient.resetStore();
      },
    });

    if (!singletonData?.removeSingleton) {
      throw new Error('Unable to delete singleton');
    }

    await this.dispatch(`${data.namespace}/fetchAllSingletons`, true);
    this.commit(`${data.namespace}/removeSingletonWithFields`, payload);
  },

  async importSingleton(_, payload: { singletonId?: string; payload: string }) {
    const { data: singletonData } = await this.$apolloClient.mutate<
      ImportSingletonMutationResponse
    >({
      mutation: ImportSingletonMutation,
      variables: {
        singletonId: payload.singletonId ?? null,
        payload: payload.payload,
      },
      update: () => {
        this.$apolloClient.resetStore();
      },
    });

    if (!singletonData?.importSingleton) {
      throw new Error('Unable to delete singleton');
    }

    await this.dispatch(`${data.namespace}/fetchAllSingletons`, true);
  },
};

export const mutations: MutationTree<SingletonState> = {
  setErrors(state, payload: string | string[]) {
    state.errors = payload;
  },

  clearErrors(state) {
    state.errors = null;
  },
};
