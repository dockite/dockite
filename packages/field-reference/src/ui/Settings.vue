<template>
  <div>
    <el-form-item label="Required">
      <el-switch v-model="settings.required" />
    </el-form-item>
    <el-form-item label="Schema Types">
      <el-select
        v-model="schemaIds"
        multiple
        filterable
        style="width: 100%"
        placeholder="Select the Schema's that documents can be reference"
      >
        <el-option
          v-for="schema in allSchemas.results"
          :key="schema.name"
          :label="schema.name"
          :value="schema.id"
        />
      </el-select>
    </el-form-item>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Fragment } from 'vue-fragment';
import gql from 'graphql-tag';
import { Schema } from '@dockite/database';

import { DockiteFieldReference } from '..';
import { ReferenceFieldSettings } from '../types';

interface SchemaResults {
  results: Pick<Schema, 'id' | 'name' | 'title'>[];
}

@Component({
  name: 'ReferenceFieldSettingsComponent',
  components: {
    Fragment,
  },
})
export default class ReferenceFieldSettingsComponent extends Vue {
  @Prop({ required: true, type: Object })
  readonly value!: ReferenceFieldSettings;

  @Prop({ required: true, type: Object })
  readonly rules!: object;

  public allSchemas: SchemaResults = { results: [] };

  get settings(): ReferenceFieldSettings {
    return this.value;
  }

  set settings(value: ReferenceFieldSettings) {
    this.$emit('input', value);
  }

  get schemaIds(): string[] {
    if (!this.settings.schemaIds) {
      return [];
    }

    return this.settings.schemaIds;
  }

  set schemaIds(value: string[]) {
    this.settings = {
      ...this.settings,
      schemaIds: value,
    };
  }

  async fetchAllSchemas(): Promise<void> {
    const { data } = await this.$apolloClient.query<{ allSchemas: SchemaResults }>({
      query: gql`
        query {
          allSchemas {
            results {
              id
              title
              name
            }
          }
        }
      `,
    });

    this.allSchemas = {
      ...data.allSchemas,
      results: [
        {
          id: 'self',
          name: 'self',
          title: 'Self',
        },
        ...data.allSchemas.results,
      ],
    };
  }

  mounted(): void {
    if (Object.keys(this.settings).length === 0) {
      this.settings = {
        ...DockiteFieldReference.defaultOptions,
      };
    }

    this.fetchAllSchemas();
  }
}
</script>

<style></style>
