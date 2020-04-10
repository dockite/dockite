import { apolloClient } from '@/apollo';
import { User } from '@dockite/types';
import { gql } from 'apollo-boost';
import { ActionTree } from 'vuex';

import { AccountState, LoginPayload, RegisterPayload } from './types';

import { RootState } from '..';

export const actions: ActionTree<AccountState, RootState> = {
  async restoreFromLocal({ commit }) {
    const token = window.localStorage.getItem('auth_token');

    if (!token) return;

    const { data: meData } = await apolloClient.query<{ me: User }>({
      query: gql`
        query MeQuery {
          me {
            id
            firstName
            lastName
            email
            createdAt
            updatedAt
            verified
          }
        }
      `,
    });

    if (!meData) return;

    commit('setUser', meData.me);
    commit('setAuthenticated', true);
  },

  async login({ commit }, loginPayload: LoginPayload): Promise<void> {
    const { data: loginData } = await apolloClient.mutate<{ login: { token: string } }>({
      mutation: gql`
        mutation LoginUser($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            token
          }
        }
      `,
      variables: { ...loginPayload },
    });

    if (!loginData) return;

    commit('setToken', loginData.login.token);

    const { data: meData } = await apolloClient.query<{ me: User }>({
      query: gql`
        query MeQuery {
          me {
            id
            firstName
            lastName
            email
            createdAt
            updatedAt
            verified
          }
        }
      `,
    });

    if (!meData) return;

    commit('setUser', meData.me);
    commit('setAuthenticated', true);
  },

  async register({ commit }, registerPayload: RegisterPayload): Promise<void> {
    const { data: registerData } = await apolloClient.mutate<{ register: { token: string } }>({
      mutation: gql`
        mutation RegisterUser(
          $email: String!
          $firstName: String!
          $lastName: String!
          $password: String!
        ) {
          register(email: $email, firstName: $firstName, lastName: $lastName, password: $password) {
            token
          }
        }
      `,
      variables: { ...registerPayload },
    });

    if (!registerData) return;

    commit('setToken', registerData.register.token);

    const { data: meData } = await apolloClient.query<{ me: User }>({
      query: gql`
        query MeQuery {
          me {
            id
            firstName
            lastName
            email
            createdAt
            updatedAt
            verified
          }
        }
      `,
    });

    if (!meData) return;

    commit('setUser', meData.me);
    commit('setAuthenticated', true);
  },

  logout({ commit }) {
    commit('setAuthenticated', false);
    commit('setUser', null);
  },
};
