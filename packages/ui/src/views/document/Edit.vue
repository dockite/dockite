<template>
  <div class="document-edit bg-white">
    <portal to="title">
      <a-row type="flex" align="middle" class="title-row">
        <h1 style="margin: 0; padding: 0;">
          {{ document && document.id ? `Update ${document.id}` : 'Loading...' }}
        </h1>
      </a-row>
    </portal>
    <a-form layout="vertical" @submit.prevent="handleSubmit">
      <a-tabs class="form-tabs" :tab-bar-gutter="0" tab-position="top">
        <a-tab-pane key="1" class="form-tab-pane" tab="Default">
          <template v-for="key in Object.keys(documentData)">
            <component
              :is="getInputField(key)"
              :key="key"
              v-model="form[key]"
              :form-data="form"
              :field-config="getFieldByKey('name', key)"
            />
          </template>
        </a-tab-pane>
        <a-tab-pane key="2" class="form-tab-pane" tab="Tab 2">Content of Tab Pane 2</a-tab-pane>
        <a-tab-pane key="3" class="form-tab-pane" tab="Tab 3">Content of Tab Pane 3</a-tab-pane>
      </a-tabs>
      <section class="form-submit-section">
        <a-button html-type="submit" type="primary" size="large">Update</a-button>
      </section>
    </a-form>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { Document, Field } from '@dockite/types';
import { gql } from 'apollo-boost';
import { startCase } from 'lodash';
import { fieldManager } from '../../dockite';

type DockiteFormField = Omit<Field, 'schemaId' | 'dockiteField'>;

@Component({
  apollo: {
    document: {
      query: gql`
        query GetDocumentById($id: String!) {
          document: getDocument(id: $id) {
            id
            locale
            data
            publishedAt
            createdAt
            updatedAt
            deletedAt
            schemaId
            releaseId
            userId
            schema {
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
        }
      `,

      variables() {
        return {
          id: this.$route.params.id,
        };
      },
    },
  },
})
export class EditDocumentPage extends Vue {
  public document!: Document;

  public startCase = startCase;

  public form: Record<string, any> = {};

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

  get documentData(): Record<string, any> {
    if (this.document?.data) {
      return this.document.data;
    }

    return {};
  }

  get fields(): DockiteFormField[] {
    if (this.document?.schema?.fields) {
      return this.document.schema.fields;
    }

    return [];
  }

  @Watch('documentData')
  handleDocumentDataChange() {
    this.form = { ...this.documentData, ...this.form };
  }

  public async handleSubmit() {
    try {
      await this.$apollo.mutate({
        mutation: gql`
          mutation($id: String!, $data: JSON!) {
            updateDocument(id: $id, data: $data) {
              id
            }
          }
        `,
        variables: { id: this.document.id, data: this.form },
      });

      this.$message.success('Document updated successfully!');
    } catch {
      this.$message.error('Unable to save document!');
    }
  }
}

export default EditDocumentPage;
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
</style>
