<template>
  <fragment>
    <portal to="header">
      <h2>Update - {{ documentId }}</h2>
    </portal>
    <div v-if="ready" class="update-document-page">
      <el-form
        ref="formEl"
        label-position="top"
        :model="form"
        :rules="formRules"
        @submit.native.prevent="submit"
      >
        <el-tabs v-model="currentTab" type="border-card">
          <el-tab-pane v-for="tab in availableTabs" :key="tab" :label="tab" :name="tab">
            <component
              :is="$dockiteFieldManager[field.type].input"
              v-for="field in getFieldsByGroupName(tab)"
              :key="field.id"
              v-model="form[field.name]"
              :name="field.name"
              :field-config="field"
              :form-data="form"
              @update:rules="handleFormRulesMerge"
            >
            </component>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <el-row type="flex" justify="space-between" align="middle" style="margin-top: 1rem;">
        <el-button type="text" @click="$router.go(-1)">
          Cancel
        </el-button>
        <el-button type="primary" @click="submit">
          Update Document
        </el-button>
      </el-row>
    </div>
  </fragment>
</template>

<script lang="ts">
import { Schema, Field, Document } from '@dockite/types';
import { Form } from 'element-ui';
import { sortBy } from 'lodash';
import { Component, Vue, Watch, Ref } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import Logo from '~/components/base/logo.vue';
import * as auth from '~/store/auth';
import * as data from '~/store/data';
import * as document from '~/store/document';

@Component({
  components: {
    Fragment,
    Logo,
  },
})
export default class UpdateDocumentPage extends Vue {
  public currentTab = 'Default';

  public form: Record<string, any> = {};

  public formRules: Record<string, object[]> = {};

  public ready = false;

  @Ref()
  readonly formEl!: Form;

  get documentId(): string {
    return this.$route.params.id;
  }

  get document(): Document | null {
    return this.$store.getters[`${data.namespace}/getDocumentById`](this.documentId);
  }

  get schemaId(): string {
    if (this.document) {
      return this.document.schemaId;
    }

    return '';
  }

  get schemaName(): string {
    return this.schema?.name ?? '';
  }

  get schema(): Schema | null {
    return this.$store.getters[`${data.namespace}/getSchemaWithFieldsById`](this.schemaId);
  }

  get fields(): Field[] {
    if (this.schema) {
      return this.schema.fields;
    }

    return [];
  }

  get groups(): Record<string, string[]> {
    if (this.schema) {
      return this.schema.groups;
    }

    return {};
  }

  get availableTabs(): string[] {
    if (this.schema) {
      return Object.keys(this.schema.groups);
    }

    return [];
  }

  get user(): string {
    return this.$store.getters[`${auth.namespace}/fullName`];
  }

  public getFieldsByGroupName(name: string): Field[] {
    const filteredFields = this.fields.filter(field => this.groups[name].includes(field.name));

    return sortBy(filteredFields, [i => this.groups[name].indexOf(i.name)]);
  }

  public getGroupNameFromFieldName(name: string): string {
    for (const key of Object.keys(this.groups)) {
      if (this.groups[key].includes(name)) {
        return key;
      }
    }

    return '';
  }

  public initialiseForm(): void {
    if (this.document) {
      this.form = { ...this.form, ...this.document.data };
    }

    this.fields.forEach(field => {
      if (!this.form[field.name]) {
        Vue.set(this.form, field.name, null);
      }
    });
  }

  public handleFormRulesMerge(rules: Record<string, object[]>): void {
    this.formRules = {
      ...this.formRules,
      ...rules,
    };
  }

  public fetchSchemaById(): Promise<void> {
    return this.$store.dispatch(`${data.namespace}/fetchSchemaWithFieldsById`, {
      id: this.schemaId,
    });
  }

  public fetchDocumentById(force = false): Promise<void> {
    return this.$store.dispatch(`${data.namespace}/fetchDocumentById`, {
      id: this.$route.params.id,
      force,
    });
  }

  public async submit(): Promise<void> {
    try {
      await this.formEl.validate();

      await this.$store.dispatch(`${document.namespace}/updateDocument`, {
        data: this.form,
        documentId: this.documentId,
        schemaId: this.schemaId,
      });

      await this.fetchDocumentById(true);

      this.$message({
        message: 'Document updated successfully',
        type: 'success',
      });
    } catch (_) {
      // It's any's all the way down
      (this.formEl as any).fields
        .filter((f: any): boolean => f.validateState === 'error')
        .forEach((f: any): void => {
          const groupName = this.getGroupNameFromFieldName(f.prop);

          this.$message({
            message: `${groupName}: ${f.validateMessage}`,
            type: 'warning',
          });
        });
    }
  }

  @Watch('documentId', { immediate: true })
  public async handleDocumentIdChange(): Promise<void> {
    this.ready = false;

    await this.fetchDocumentById();
    await this.fetchSchemaById();

    this.initialiseForm();

    this.currentTab = this.availableTabs[0];

    this.ready = true;
  }
}
</script>

<style></style>
