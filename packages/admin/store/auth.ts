import { User } from '@dockite/database';
import { ActionTree, GetterTree, MutationTree } from 'vuex';

import { RootState } from '.';

import {
  LoginMutationResponse,
  RegisterFirstUserMutationResponse,
  MeQueryResponse,
  ForgottenPasswordMutationResponse,
  ResetForgottenPasswordMutationResponse,
} from '~/common/types';
import ForgottenPasswordMutation from '~/graphql/mutations/forgotten-password.gql';
import LoginMutation from '~/graphql/mutations/login.gql';
import LogoutMutation from '~/graphql/mutations/logout.gql';
import RegisterFirstUserMutation from '~/graphql/mutations/register-first-user.gql';
import ResetForgottenPasswordMutation from '~/graphql/mutations/reset-forgotten-password.gql';
import MeQuery from '~/graphql/queries/me.gql';

interface JWTToken {
  exp: number;
}

export interface AuthState {
  authenticated: boolean;
  user: User | null;
  token: string | null;
  tokenDecoded: JWTToken | null;
}

export interface LoginActionPayload {
  email: string;
  password: string;
}

export interface RegisterActionPayload {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export const namespace = 'auth';

export const state = (): AuthState => ({
  authenticated: false,
  user: null,
  token: null,
  tokenDecoded: null,
});

export const getters: GetterTree<AuthState, RootState> = {
  tokenExpired(state): boolean {
    if (!state.tokenDecoded) {
      return true;
    }

    return Date.now() / 1000 > state.tokenDecoded.exp;
  },

  fullName(state): string {
    if (!state.user) {
      return '';
    }

    return `${state.user.firstName} ${state.user.lastName}`;
  },
};

export const actions: ActionTree<AuthState, RootState> = {
  async init({ dispatch, commit }): Promise<void> {
    const token = window.localStorage.getItem('apollo-token');
    if (token) {
      commit('setToken', token);

      await dispatch('fetchUser');

      commit('setAuthenticated', true);
    }
  },

  async login({ commit }, payload: LoginActionPayload): Promise<void> {
    const { data } = await this.$apolloClient.mutate<LoginMutationResponse>({
      mutation: LoginMutation,
      variables: { ...payload },
    });

    if (!data?.login) {
      throw new Error('not data.login');
    }

    commit('setToken', data.login.token);
    commit('setUser', data.login.user);
    commit('setAuthenticated', true);
  },

  async registerFirstUser({ commit }, payload: RegisterActionPayload): Promise<void> {
    const { data } = await this.$apolloClient.mutate<RegisterFirstUserMutationResponse>({
      mutation: RegisterFirstUserMutation,
      variables: { ...payload },
    });

    if (!data?.registerFirstUser) {
      throw new Error('not data.registerFirstUser');
    }

    commit('setToken', data.registerFirstUser.token);
    commit('setUser', data.registerFirstUser.user);
    commit('setAuthenticated', true);
  },

  async logout({ commit }): Promise<void> {
    await this.$apolloClient.mutate({
      mutation: LogoutMutation,
    });

    commit('clearToken');
    commit('setUser', null);
    commit('setAuthenticated', false);

    await this.$apolloClient.clearStore();
  },

  async fetchUser({ commit }): Promise<void> {
    const { data } = await this.$apolloClient.query<MeQueryResponse>({
      query: MeQuery,
    });

    if (!data.me) {
      throw new Error('Unable to retrieve user details');
    }

    commit('setUser', data.me);
  },

  async forgottenPassword(_, payload: string): Promise<void> {
    const { data } = await this.$apolloClient.mutate<ForgottenPasswordMutationResponse>({
      mutation: ForgottenPasswordMutation,
      variables: { email: payload },
    });

    if (!data) {
      throw new Error('unable to process forgotten password request');
    }
  },

  async resetForgottenPassword(_, payload: { token: string; password: string }): Promise<void> {
    const { data } = await this.$apolloClient.mutate<ResetForgottenPasswordMutationResponse>({
      mutation: ResetForgottenPasswordMutation,
      variables: { token: payload.token, password: payload.password },
    });

    if (!data) {
      throw new Error('unable to process forgotten password reset');
    }
  },
};

export const mutations: MutationTree<AuthState> = {
  setToken(state, payload: string): void {
    state.token = payload;

    const [, claims] = payload.split('.');

    state.tokenDecoded = JSON.parse(atob(claims)) as JWTToken;

    window.localStorage.setItem('apollo-token', state.token);
    window.localStorage.setItem('apollo-token-decoded', atob(claims));
  },

  setUser(state, payload: User): void {
    state.user = payload;
  },

  setAuthenticated(state, payload: boolean): void {
    state.authenticated = payload;
  },

  clearToken(): void {
    window.localStorage.removeItem('apollo-token');
    window.localStorage.removeItem('apollo-token-decoded');
  },
};
