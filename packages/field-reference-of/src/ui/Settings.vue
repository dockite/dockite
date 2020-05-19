<template>
  <fragment>
    <el-form-item label="Schema Type">
      <el-select
        v-model="schemaId"
        style="width: 100%"
        placeholder="Select the Schema to get all references from "
      >
        <el-select-option
          v-for="schema in allSchemas.results"
          :key="schema.id"
        >
          {{ schema.name }}
        </el-select-option>
      </el-select>
    </el-form-item>
    <el-form-item label="Reference Field">
      <el-select
        v-model="fieldName"
        style="width: 100%"
        placeholder="Select the the reference field name"
      >
        <el-select-option
          v-for="field in referenceFields"
          :key="field.name"
        >
          {{ field.name }}
        </el-select-option>
      </el-select>
    </el-form-item>
  </fragment>
</template>

<script>
import { Fragment } from 'vue-fragment';
import gql from 'graphql-tag';
import { find } from 'lodash';

export default {
  name: 'ReferenceOfSettings',

  apollo: {
    allSchemas: {
      query: gql`
        query {
          allSchemas {
            results {
              id
              name
              fields {
                id
                name
                type
              }
            }
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
      allSchemas: { results: [] },
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

    schemaId: {
      get() {
        if (!this.settings.schemaId) {
          return null;
        }

        return this.settings.schemaId;
      },
      set(value) {
        this.settings.schemaId = value;
      },
    },

    fieldName: {
      get() {
        if (!this.settings.fieldName) {
          return null;
        }

        return this.settings.fieldName;
      },
      set(value) {
        this.settings.fieldName = value;
      },
    },

    referenceFields() {
      const schema = find(this.allSchemas.results, (s) => s.id === this.schemaId);

      if (!schema) return [];

      return schema.fields.filter((f) => f.type === 'reference');
    },
  },

  mounted() {
    this.settings = {
      required: false,
      schemaId: null,
      fieldName: null,
    };
  },
};
</script>

<style></style>
