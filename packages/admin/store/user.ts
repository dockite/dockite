import { ActionTree, GetterTree, MutationTree } from 'vuex';

import { RootState } from '.';

import {
  CreateUserMutationResponse,
  DeleteUserMutationResponse,
  UpdateUserMutationResponse,
  ResetUserPasswordMutationResponse,
  UpdateUserPasswordMutationResponse,
  CreateAPIKeyMutationResponse,
  RemoveAPIKeyMutationResponse,
} from '~/common/types';
import CreateAPIKeyMutation from '~/graphql/mutations/create-api-key.gql';
import CreateUserMutation from '~/graphql/mutations/create-user.gql';
import DeleteAPIKeyMutation from '~/graphql/mutations/delete-api-key.gql';
import DeleteUserMutation from '~/graphql/mutations/delete-user.gql';
import ResetUserPasswordMutation from '~/graphql/mutations/reset-user-password.gql';
import UpdateUserPasswordMutation from '~/graphql/mutations/update-password.gql';
import UpdateUserMutation from '~/graphql/mutations/update-user.gql';
import * as auth from '~/store/auth';
import * as data from '~/store/data';

export interface UserState {
  errors: null | string | string[];
}

export interface CreateUserPayload {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  roles: string[];
  scopes: string[];
}

export interface UpdateUserPayload extends CreateUserPayload {
  id: string;
}

export interface DeleteUserPayload {
  userId: string;
}

export const namespace = 'user';

export const state = (): UserState => ({
  errors: null,
});

export const getters: GetterTree<UserState, RootState> = {};

export const actions: ActionTree<UserState, RootState> = {
  async createUser(_, payload: CreateUserPayload): Promise<void> {
    const { data: createData } = await this.$apolloClient.mutate<CreateUserMutationResponse>({
      mutation: CreateUserMutation,
      variables: {
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        password: payload.password,
        roles: payload.roles,
        scopes: payload.scopes,
      },
      update: () => {
        this.$apolloClient.resetStore();
        this.commit(`${data.namespace}/clearUserData`);
      },
    });

    if (!createData?.createUser) {
      throw new Error('Unable to create user');
    }
  },

  async updateUser(_, payload: UpdateUserPayload): Promise<void> {
    const { data: userData } = await this.$apolloClient.mutate<UpdateUserMutationResponse>({
      mutation: UpdateUserMutation,
      variables: {
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        password: payload.password,
        roles: payload.roles,
        scopes: payload.scopes,
      },
      update: () => {
        this.commit(`${data.namespace}/clearUserData`, payload.id);
      },
    });

    if (!userData?.updateUser) {
      throw new Error('Unable to update user');
    }
  },

  async deleteUser(_, payload: DeleteUserPayload): Promise<void> {
    const { data: deleteData } = await this.$apolloClient.mutate<DeleteUserMutationResponse>({
      mutation: DeleteUserMutation,
      variables: {
        id: payload.userId,
      },
      update: () => {
        this.$apolloClient.resetStore();
        this.commit(`${data.namespace}/clearUserData`, payload.userId);
      },
    });

    if (!deleteData?.removeUser) {
      throw new Error('Unable to delete user');
    }
  },

  async resetUserPassword(_, payload: string): Promise<void> {
    const { data: resetPasswordData } = await this.$apolloClient.mutate<
      ResetUserPasswordMutationResponse
    >({
      mutation: ResetUserPasswordMutation,
      variables: {
        email: payload,
      },
    });

    if (!resetPasswordData?.resetUserPassword) {
      throw new Error('Unable to reset user password');
    }
  },

  async updateUserPassword(_, payload: string): Promise<void> {
    const { data: updateUserPasswordData } = await this.$apolloClient.mutate<
      UpdateUserPasswordMutationResponse
    >({
      mutation: UpdateUserPasswordMutation,
      variables: {
        password: payload,
      },
    });

    if (!updateUserPasswordData?.updatePassword) {
      throw new Error('Unable to update user password');
    }
  },

  async createAPIKey(_): Promise<void> {
    const { data: createAPIKeyData } = await this.$apolloClient.mutate<
      CreateAPIKeyMutationResponse
    >({
      mutation: CreateAPIKeyMutation,
    });

    if (!createAPIKeyData?.createAPIKey) {
      throw new Error('Unable to create api key');
    }

    this.commit(`${auth.namespace}/setUser`, createAPIKeyData.createAPIKey);
  },

  async removeAPIKey(_, payload: string): Promise<void> {
    const { data: createAPIKeyData } = await this.$apolloClient.mutate<
      RemoveAPIKeyMutationResponse
    >({
      mutation: DeleteAPIKeyMutation,
      variables: {
        apiKey: payload,
      },
    });

    if (!createAPIKeyData?.removeAPIKey) {
      throw new Error('Unable to create api key');
    }

    this.commit(`${auth.namespace}/setUser`, createAPIKeyData.removeAPIKey);
  },
};

export const mutations: MutationTree<UserState> = {
  setErrors(state, payload: string | string[]) {
    state.errors = payload;
  },

  clearErrors(state) {
    state.errors = null;
  },
};
