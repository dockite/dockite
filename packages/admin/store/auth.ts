import { User } from '@dockite/types';
import { ActionTree, GetterTree, MutationTree } from 'vuex';

import { RootState } from '.';

import { LoginMutationResponse, MeQueryResponse } from '~/common/types';
import LoginMutation from '~/graphql/mutations/login.gql';
import MeQuery from '~/graphql/queries/me.gql';

interface JWTToken {
  exp: number;
}

export interface AuthState {
  authenticated: boolean;
  user: Omit<User, 'password'> | null;
  token: string | null;
  tokenDecoded: JWTToken | null;
}

export interface LoginActionPayload {
  email: string;
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
  async init({ dispatch, commit }) {
    const token = window.localStorage.getItem('apollo-token');
    if (token) {
      commit('setToken', token);

      await this.$apolloHelpers.onLogin(token);

      await dispatch('fetchUser');

      commit('setAuthenticated', true);
    }
  },

  async login({ commit }, payload: LoginActionPayload) {
    const { data } = await this.$apolloClient.mutate<LoginMutationResponse>({
      mutation: LoginMutation,
      variables: { ...payload },
    });

    if (!data?.login) {
      throw new Error('not data.login');
    }

    await this.$apolloHelpers.onLogin(data.login.token);
    commit('setToken', data.login.token);
    commit('setUser', data.login.user);
    commit('setAuthenticated', true);
  },

  logout({ commit }) {
    commit('clearToken');
    commit('setUser', null);
    commit('setAuthenticated', false);
  },

  async fetchUser({ commit }) {
    const { data } = await this.$apolloClient.query<MeQueryResponse>({
      query: MeQuery,
    });

    if (!data.me) {
      throw new Error('Unable to retrieve user details');
    }

    commit('setUser', data.me);
  },
};

export const mutations: MutationTree<AuthState> = {
  setToken(state, payload: string) {
    state.token = payload;

    const [, claims] = payload.split('.');

    state.tokenDecoded = JSON.parse(atob(claims)) as JWTToken;

    window.localStorage.setItem('apollo-token', state.token);
    window.localStorage.setItem('apollo-token-decoded', atob(claims));
  },
  setUser(state, payload: Omit<User, 'password'>) {
    state.user = payload;
  },
  setAuthenticated(state, payload: boolean) {
    state.authenticated = payload;
  },
  clearToken() {
    window.localStorage.removeItem('apollo-token');
    window.localStorage.removeItem('apollo-token-decoded');
  },
};
