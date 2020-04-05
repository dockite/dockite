import { apolloClient } from '@/apollo';
import { DockiteFormField } from '@/common/types';
import gql from 'graphql-tag';
import { ActionTree } from 'vuex';

import { SchemaState, CreateSchemaPayload, UpdateSchemaPayload } from './types';

import { RootState } from '..';

export const actions: ActionTree<SchemaState, RootState> = {
  async create({ commit }, payload: CreateSchemaPayload) {
    const { data } = await apolloClient.mutate<{ createSchema: { id: string } }>({
      mutation: gql`
        mutation CreateSchemaMutation(
          $name: String!
          $type: SchemaType!
          $groups: JSON!
          $settings: JSON!
        ) {
          createSchema(name: $name, type: $type, groups: $groups, settings: $settings) {
            id
          }
        }
      `,
      variables: {
        name: payload.name,
        type: payload.type,
        groups: payload.groups,
        settings: payload.settings,
      },
    });

    if (!data) throw new Error('Error creating schema');

    const schemaId = data.createSchema.id;

    const fieldMutations = payload.fields
      .filter((field: DockiteFormField) => !field.id)
      .map((field: DockiteFormField) =>
        apolloClient.mutate({
          mutation: gql`
            mutation CreateSchemaField(
              $schemaId: String!
              $name: String!
              $type: String!
              $title: String!
              $description: String!
              $settings: JSON!
            ) {
              createField(
                schemaId: $schemaId
                name: $name
                type: $type
                title: $title
                description: $description
                settings: $settings
              ) {
                id
              }
            }
          `,
          variables: { schemaId, ...field },
        }),
      );

    await Promise.all(fieldMutations);

    commit('setSchemaId', schemaId);
  },

  async update({ commit }, payload: UpdateSchemaPayload) {
    const { data } = await apolloClient.mutate<{ createSchema: { id: string } }>({
      mutation: gql`
        mutation UpdateSchemaMutation($id: String!, $groups: JSON!, $settings: JSON!) {
          updateSchema(id: $id, groups: $groups, settings: $settings) {
            id
          }
        }
      `,
      variables: {
        id: payload.id,
        groups: payload.groups,
        settings: payload.settings,
      },
    });

    if (!data) throw new Error('Error updating schema');

    const fieldMutations = payload.fields
      .filter((field: DockiteFormField) => !field.id)
      .map((field: DockiteFormField) =>
        apolloClient.mutate({
          mutation: gql`
            mutation CreateSchemaField(
              $schemaId: String!
              $name: String!
              $type: String!
              $title: String!
              $description: String!
              $settings: JSON!
            ) {
              createField(
                schemaId: $schemaId
                name: $name
                type: $type
                title: $title
                description: $description
                settings: $settings
              ) {
                id
              }
            }
          `,
          variables: { schemaId: payload.id, ...field },
        }),
      );

    const deletedFieldMutations = payload.deletedFields
      .filter((field: DockiteFormField) => !!field.id)
      .map((field: DockiteFormField) =>
        apolloClient.mutate({
          mutation: gql`
            mutation DeleteField($id: String!) {
              removeField(id: $id)
            }
          `,

          variables: { id: field.id },
        }),
      );

    await Promise.all([...fieldMutations, ...deletedFieldMutations]);

    commit('setSchemaId', payload.id);
  },

  async delete({ commit }, schemaId: string) {
    await apolloClient.mutate({
      mutation: gql`
        mutation($id: String!) {
          removeSchema(id: $id)
        }
      `,

      variables: { id: schemaId },
    });

    commit('setSchemaId', null);
  },
};
