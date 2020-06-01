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
import { Schema } from '@dockite/types';

interface Settings {
  required: boolean;
  schemaIds: string[];
}

interface SchemaResults {
  results: Schema[];
}

@Component({
  name: 'ReferenceFieldSettingsComponent',
  components: {
    Fragment,
  },
})
export default class ReferenceFieldSettingsComponent extends Vue {
  @Prop({ required: true, type: Object })
  readonly value!: any;

  @Prop({ required: true, type: Object })
  readonly rules!: object;

  public allSchemas: SchemaResults = { results: [] };

  get settings(): Settings {
    return this.value;
  }

  set settings(value: Settings) {
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
    const { data } = await this.$apolloClient.query<{allSchemas: SchemaResults}>({
      query: gql`
        query {
          allSchemas {
            results {
              id
              name
            }
          }
        }
      `,
    });

    this.allSchemas = data.allSchemas;
  }

  mounted(): void {
    if (Object.keys(this.settings).length === 0) {
      this.settings = {
        required: false,
        schemaIds: [],
      };
    }

    this.fetchAllSchemas();
  }
}
</script>

<style></style>
