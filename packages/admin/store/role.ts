import { ActionTree, GetterTree, MutationTree } from 'vuex';

import { RootState } from '.';

import {
  CreateRoleMutationResponse,
  DeleteRoleMutationResponse,
  UpdateRoleMutationResponse,
} from '~/common/types';
import CreateRoleMutation from '~/graphql/mutations/create-role.gql';
import DeleteRoleMutation from '~/graphql/mutations/delete-role.gql';
import UpdateRoleMutation from '~/graphql/mutations/update-role.gql';
import * as data from '~/store/data';

export interface RoleState {
  errors: null | string | string[];
}

export interface CreateRolePayload {
  name: string;
  scopes: string[];
}

export type UpdateRolePayload = CreateRolePayload;

export interface DeleteRolePayload {
  roleName: string;
}

export const namespace = 'role';

export const state = (): RoleState => ({
  errors: null,
});

export const getters: GetterTree<RoleState, RootState> = {};

export const actions: ActionTree<RoleState, RootState> = {
  async createRole(_, payload: CreateRolePayload): Promise<void> {
    const { data: createData } = await this.$apolloClient.mutate<CreateRoleMutationResponse>({
      mutation: CreateRoleMutation,
      variables: {
        name: payload.name,
        scopes: payload.scopes,
      },
      update: () => {
        this.$apolloClient.resetStore();
        this.commit(`${data.namespace}/clearRoleData`);
      },
    });

    if (!createData?.createRole) {
      throw new Error('Unable to create role');
    }
  },

  async updateRole(_, payload: UpdateRolePayload): Promise<void> {
    const { data: roleData } = await this.$apolloClient.mutate<UpdateRoleMutationResponse>({
      mutation: UpdateRoleMutation,
      variables: {
        name: payload.name,
        scopes: payload.scopes,
      },
      update: () => {
        this.$apolloClient.resetStore();
        this.commit(`${data.namespace}/clearRoleData`, payload.name);
      },
    });

    if (!roleData?.updateRole) {
      throw new Error('Unable to update role');
    }
  },

  async deleteRole(_, payload: DeleteRolePayload): Promise<void> {
    const { data: deleteData } = await this.$apolloClient.mutate<DeleteRoleMutationResponse>({
      mutation: DeleteRoleMutation,
      variables: {
        name: payload.roleName,
      },
      update: () => {
        this.$apolloClient.resetStore();
        this.commit(`${data.namespace}/clearRoleData`, payload.roleName);
      },
    });

    if (!deleteData?.removeRole) {
      throw new Error('Unable to delete role');
    }
  },
};

export const mutations: MutationTree<RoleState> = {
  setErrors(state, payload: string | string[]) {
    state.errors = payload;
  },

  clearErrors(state) {
    state.errors = null;
  },
};
