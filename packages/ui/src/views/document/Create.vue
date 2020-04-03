<template>
  <div class="document-edit bg-white">
    <portal to="title">
      <a-row type="flex" align="middle" justify="space-between" class="title-row">
        <h1>
          {{ schema && schema.name ? `Create ${schema.name}` : 'Loading...' }}
        </h1>
        <a-select default-value="en-AU" class="locale-selector">
          <a-select-option value="en-AU" class="locale-selector">
            <vue-country-flag country="au" size="normal" style="transform: scale(0.4);" />
          </a-select-option>
        </a-select>
      </a-row>
    </portal>
    <a-form v-if="!$apollo.loading" layout="vertical" @submit.prevent="handleSubmit">
      <a-tabs class="form-tabs" :tab-bar-gutter="0" tab-position="top">
        <a-tab-pane v-for="group in groups" :key="group" class="form-tab-pane" :tab="group">
          <template v-for="field in Object.keys(form)">
            <component
              :is="getInputField(field)"
              :key="field"
              v-model="form[field]"
              :form-data="form"
              :field-config="getFieldByKey('name', field)"
            />
          </template>
        </a-tab-pane>
      </a-tabs>
      <section class="form-submit-section">
        <a-button html-type="submit" type="primary" size="large">
          Create
        </a-button>
      </section>
    </a-form>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { Schema, Field } from '@dockite/types';
import { gql } from 'apollo-boost';
import { startCase, has } from 'lodash';
import VueCountryFlag from 'vue-country-flag';
import { fieldManager } from '../../dockite';
import { DocumentState } from '../../store/document/types';

type DockiteFormField = Omit<Field, 'schemaId' | 'dockiteField'>;

@Component({
  components: {
    VueCountryFlag,
  },
  apollo: {
    schema: {
      query: gql`
        query GetSchemaByName($name: String!) {
          schema: getSchema(name: $name) {
            id
            name
            fields {
              id
              name
              title
              description
              type
              settings
            }
          }
        }
      `,

      variables() {
        return {
          name: this.$route.params.schema,
        };
      },
    },
  },
})
export class CreateDocumentPage extends Vue {
  public schema!: Partial<Schema>;

  public form: Record<string, any> = {};

  public groups: string[] = ['Default'];

  public getInputField(name: string) {
    const field = this.getFieldByKey('name', name);

    if (!field) {
      return null;
    }

    if (fieldManager[field.type]) {
      return fieldManager[field.type].input;
    }

    return null;
  }

  public getFieldByKey(key: keyof DockiteFormField, value: string): DockiteFormField | null {
    const found = this.fields.find(field => field[key] === value);

    if (found) {
      return found;
    }

    return null;
  }

  get fields(): DockiteFormField[] {
    if (this.schema?.fields) {
      return this.schema.fields;
    }

    return [];
  }

  public initialiseFields() {
    if (this.fields.length > 0) {
      this.fields.forEach(field => {
        if (!has(this.form, field.name)) {
          console.log('Adding field');
          Vue.set(this.form, field.name, null);
        }
      });
    }
  }

  @Watch('fields')
  public handleFieldsUpdate() {
    this.initialiseFields();
  }

  public async handleSubmit() {
    try {
      await this.$store.dispatch('document/create', {
        schemaId: this.schema.id,
        data: this.form,
        locale: 'en-AU',
      });

      const { documentId } = this.$store.state.document as DocumentState;

      this.$message.success('Document created successfully!');
      this.$router.push(`/documents/${documentId}`);
    } catch {
      this.$message.error('Unable to create document!');
    }
  }

  mounted() {
    this.initialiseFields();
  }
}

export default CreateDocumentPage;
</script>

<style lang="scss">
.form-tabs {
  .ant-tabs-tab {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }

  .ant-tabs-tab-active {
    background: mix(#1890ff, #ffffff, 10%);
  }

  .ant-form-item {
    margin-bottom: 0;
  }
}

.form-tab-pane {
  padding: 1rem;
}

.form-submit-section {
  display: flex;
  flex-direction: row-reverse;
  width: 100%;
  padding: 0 1rem 1rem 1rem;
}

.locale-selector {
  display: flex;
  align-items: center;

  .locale-name {
    padding-left: 0.75rem;
  }
}
</style>
