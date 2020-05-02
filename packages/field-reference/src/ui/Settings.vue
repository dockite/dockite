<template>
  <fragment>
    <a-form-model-item label="Required">
      <a-switch v-model="settings.required" />
    </a-form-model-item>
    <a-form-model-item label="Schema Types">
      <a-select
        v-model="schemaIds"
        mode="multiple"
        style="width: 100%"
        placeholder="Select the Schema's that documents can be reference"
      >
        <a-select-option
          v-for="schema in allSchemas"
          :key="schema.name"
        >
          {{ schema.name }}
        </a-select-option>
      </a-select>
    </a-form-model-item>
  </fragment>
</template>

<script>
import { Fragment } from 'vue-fragment';
import { find } from 'lodash';
import gql from 'graphql-tag';

export default {
  apollo: {
    allSchemas: {
      query: gql`
        query {
          allSchemas {
            id
            name
          }
        }
      `,
    },
  },

  components: {
    Fragment,
  },

  props: {
    value: {
      type: Object,
      required: true,
    },

    rules: {
      type: Object,
      required: true,
    },

    apolloClient: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      allSchemas: [],
    };
  },

  computed: {
    settings: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },

    schemaIds: {
      get() {
        if (!this.settings.schemaIds) {
          return [];
        }

        return this.settings.schemaIds.map(
          (x) => find(this.allSchemas, (s) => s.id === x).name,
        );
      },
      set(value) {
        this.settings.schemaIds = value.map(
          (x) => find(this.allSchemas, (s) => s.name === x).id,
        );
      },
    },
  },

  mounted() {
    this.settings = {
      required: false,
      schemaIds: [],
    };
  },
};
</script>

<style></style>
