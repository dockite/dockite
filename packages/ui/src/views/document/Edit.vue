<template>
  <div class="document-edit bg-white">
    <portal to="title">
      <a-row type="flex" align="middle" class="title-row">
        <h1 style="margin: 0; padding: 0;">
          {{ getDocument && getDocument.id ? `Update ${getDocument.id}` : 'Loading...' }}
        </h1>
      </a-row>
    </portal>
    <div v-if="!$apollo.loading">
      <a-form layout="vertical" @submit.prevent="handleSubmit">
        <a-tabs v-model="selectedGroup" class="form-tabs" :tab-bar-gutter="0" tab-position="top">
          <a-tab-pane
            v-for="group in Object.keys(groups)"
            :key="group"
            class="form-tab-pane"
            :tab="group"
          >
            <template v-for="key in Object.keys(form).filter(filterBySelectedGroup)">
              <component
                :is="getInputField(key)"
                :key="key"
                v-model="form[key]"
                :form-data="form"
                :field-config="getFieldByKey('name', key)"
                @update:rules="handleRulesMerge"
              />
            </template>
          </a-tab-pane>
        </a-tabs>
        <section class="form-submit-section">
          <a-button html-type="submit" type="primary" size="large">Update</a-button>
        </section>
      </a-form>
    </div>
  </div>
</template>

<script lang="ts">
import { Document, Field } from '@dockite/types';
import gql from 'graphql-tag';
import { startCase } from 'lodash';
import { Component, Vue, Watch } from 'vue-property-decorator';

import { DockiteFormField } from '../../common/types';
import { fieldManager } from '../../dockite';
import GetDocumentById from '../../queries/GetDocumentById.gql';

@Component({
  apollo: {
    getDocument: {
      query: GetDocumentById,
      variables() {
        return {
          id: this.$route.params.id,
        };
      },
    },
  },
})
export class EditDocumentPage extends Vue {
  public getDocument: Document | null = null;

  public startCase = startCase;

  public form: Record<string, any> = {};

  public formRules: Record<string, object[]> = {};

  public selectedGroup = '';

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

  public handleRulesMerge(rules: Record<string, object[]>): void {
    this.formRules = {
      ...this.formRules,
      ...rules,
    };
  }

  get documentData(): Record<string, any> {
    if (this.getDocument?.data) {
      return this.getDocument.data;
    }

    return {};
  }

  get groups(): Record<string, string[]> {
    if (this.getDocument?.schema?.groups) {
      return this.getDocument.schema.groups;
    }

    return {};
  }

  @Watch('groups', { immediate: true })
  handleGroupsChange() {
    if (Object.keys(this.groups).length > 0) {
      [this.selectedGroup] = Object.keys(this.groups);
    }
  }

  public filterBySelectedGroup(field: string): boolean {
    if (this.groups[this.selectedGroup]) {
      return this.groups[this.selectedGroup].includes(field);
    }

    return false;
  }

  get fields(): DockiteFormField[] {
    if (this.getDocument?.schema?.fields) {
      return this.getDocument.schema.fields;
    }

    return [];
  }

  @Watch('fields', { immediate: true })
  handleFieldsChange() {
    this.fields.forEach(field => {
      if (!this.form[field.name]) {
        Vue.set(this.form, field.name, null);
      }
    });
  }

  @Watch('documentData', { immediate: true })
  handleDocumentDataChange() {
    this.form = { ...this.form, ...this.documentData };
  }

  public async handleSubmit() {
    try {
      if (!this.getDocument.id) return;

      await this.$apollo.mutate({
        mutation: gql`
          mutation($id: String!, $data: JSON!) {
            updateDocument(id: $id, data: $data) {
              id
            }
          }
        `,
        variables: { id: this.getDocument.id, data: this.form },
      });

      this.$message.success('Document updated successfully!');
      this.$router.push('/documents');
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
