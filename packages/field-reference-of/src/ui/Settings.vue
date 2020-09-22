<template>
  <fragment>
    <el-form-item label="Schema Type" prop="settings.schemaId">
      <el-select
        v-model="schemaId"
        filterable
        style="width: 100%"
        placeholder="Select the Schema to get all references from "
      >
        <el-option
          v-for="schema in allSchemas.results"
          :key="schema.id"
          :label="schema.name"
          :value="schema.id"
        >
          {{ schema.name }}
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="Reference Field" prop="settings.fieldName">
      <el-select
        v-model="fieldName"
        filterable
        style="width: 100%"
        placeholder="Select the reference field name"
      >
        <el-option
          v-for="field in referenceFields"
          :key="field.name"
          :label="field.title"
          :value="field.name"
        >
          {{ field.name }}
        </el-option>
      </el-select>
    </el-form-item>
  </fragment>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Fragment } from 'vue-fragment';
import gql from 'graphql-tag';
import { find } from 'lodash';
import { Field, Schema } from '@dockite/database';

import { DockiteFieldReferenceOf } from '..';
import { ReferenceOfFieldSettings } from '../types';

interface SchemaResults {
  results: Pick<Schema, 'id' | 'name' | 'title' | 'fields'>[];
}

@Component({
  name: 'ReferenceOfFieldSettingsComponent',
  components: {
    Fragment,
  },
})
export default class ReferenceOfFieldSettingsComponent extends Vue {
  @Prop({ required: true })
  readonly value!: ReferenceOfFieldSettings;

  @Prop({ required: true })
  readonly rules!: object;

  @Prop({ required: true })
  readonly fields!: Field[];

  public allSchemas: SchemaResults = { results: [] };

  get settings(): ReferenceOfFieldSettings {
    return this.value;
  }

  set settings(value) {
    this.$emit('input', value);
  }

  get schemaId(): string | null {
    if (!this.settings.schemaId) {
      return null;
    }

    return this.settings.schemaId;
  }

  set schemaId(value: string | null) {
    this.settings.schemaId = value;
  }

  get fieldName(): string | null {
    if (!this.settings.fieldName) {
      return null;
    }

    return this.settings.fieldName;
  }

  set fieldName(value: string | null) {
    this.settings.fieldName = value;
  }

  get referenceFields(): Field[] {
    const schema = find(this.allSchemas.results, s => s.id === this.schemaId);

    if (!schema) return [];

    return schema.fields.filter(f => f.type.includes('reference'));
  }

  public async fetchAllSchemas(): Promise<void> {
    const { data } = await this.$apolloClient.query<{ allSchemas: SchemaResults }>({
      query: gql`
        {
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
    });

    this.allSchemas = {
      ...data.allSchemas,
      results: [
        {
          id: 'self',
          name: 'self',
          title: 'Self',
          fields: this.fields,
        },
        ...data.allSchemas.results,
      ],
    };
  }

  mounted(): void {
    this.fetchAllSchemas();

    if (Object.keys(this.settings).length === 0) {
      this.settings = {
        ...DockiteFieldReferenceOf.defaultOptions,
      };
    }

    this.$emit('update:rules', {
      fieldName: [
        {
          required: true,
          message: 'Reference Field is required',
          trigger: 'blur',
        },
      ],
      schemaId: [
        {
          required: true,
          message: 'Schema Type is required',
          trigger: 'blur',
        },
      ],
    });
  }

  destroyed(): void {
    this.$emit('update:rules', {});
  }
}
</script>

<style></style>
