<template>
  <fragment>
    <portal to="header">
      <el-row type="flex" justify="space-between" align="middle">
        <h2>
          <span class="font-bold">Update {{ schema && schema.title }}:</span>
          {{ documentIdentifier }}
        </h2>

        <document-actions-dropdown
          v-if="schema && document"
          :disabled="dirty"
          :document="document"
          :document-id="documentId"
          :schema="schema"
          :handle-save-and-publish="submit"
        />
      </el-row>
    </portal>

    <div v-loading="loading > 0" class="update-document-page el-loading-parent__min-height">
      <div>
        <el-form
          v-if="ready"
          ref="formEl"
          label-position="top"
          :model="form"
          @submit.native.prevent="submit"
        >
          <el-tabs v-model="currentTab" type="border-card">
            <el-tab-pane v-for="tab in availableTabs" :key="tab" :name="tab">
              <div
                slot="label"
                class="el-tab-pane__label"
                :class="{ 'is-warning': tabErrors[tab] }"
              >
                {{ tab }}
              </div>

              <div v-for="field in getFieldsByGroupName(tab)" :key="field.id">
                <component
                  :is="$dockiteFieldManager[field.type].input"
                  v-if="$dockiteFieldManager[field.type].input && !field.settings.hidden"
                  v-model="form[field.name]"
                  :errors="validationErrors"
                  :name="field.name"
                  :field-config="field"
                  :form-data="form"
                  :schema="schema"
                  :groups.sync="groups"
                />
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-form>
      </div>

      <div
        class="dockite-document--history-hook border border-r-0 px-1 py-2 text-gray-600 cursor-pointer shadow"
        @click="showHistoryDrawer = true"
      >
        <i class="el-icon-caret-left"></i>
      </div>

      <el-drawer
        custom-class="dockite-document--history-drawer"
        title="Document History"
        :visible.sync="showHistoryDrawer"
      >
        <div class="dockite-document--actions-drawer-revisions p-3">
          <el-alert
            v-if="document"
            type="info"
            show-icon
            :closable="false"
            style="margin-bottom: 0.5rem"
          >
            <template slot="title">
              Current version by {{ document.user.firstName }} {{ document.user.lastName }}
            </template>

            Update occurred {{ document.updatedAt | fromNow }}
          </el-alert>

          <el-alert
            v-for="revision in revisions"
            :key="revision.id"
            style="margin-bottom: 0.5rem"
            type="info"
            :closable="false"
            show-icon
          >
            <template slot="title">
              Updated by {{ revision.user.firstName }} {{ revision.user.lastName }}
            </template>
            Update occurred {{ revision.createdAt | fromNow }}
            <router-link
              style="display: block;"
              :to="`/documents/${documentId}/revisions/compare?from=${revision.id}&to=current`"
            >
              Compare changes
            </router-link>
          </el-alert>
        </div>
      </el-drawer>
    </div>
  </fragment>
</template>

<script lang="ts">
import { Schema, Field, Document } from '@dockite/database';
import { Form } from 'element-ui';
import { GraphQLError } from 'graphql';
import { sortBy, cloneDeep } from 'lodash';
import { Component, Vue, Watch, Ref } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import { ManyResultSet, AllDocumentRevisionsResultItem } from '../../../common/types';

import Logo from '~/components/base/logo.vue';
import DocumentActionsDropdown from '~/components/documents/actions-dropdown.vue';
import * as auth from '~/store/auth';
import * as data from '~/store/data';
import * as document from '~/store/document';

@Component({
  components: {
    DocumentActionsDropdown,
    Fragment,
    Logo,
  },
})
export default class UpdateDocumentPage extends Vue {
  public currentTab = 'Default';

  public form: Record<string, any> = {};

  public tabErrors: Record<string, boolean> = {};

  public ready = false;

  public loading = 0;

  public showHistoryDrawer = false;

  public actionsDrawerVisible = false;

  public localGroups: Record<string, string[]> | null = null;

  public dirty = false;

  public validationErrors: Record<string, string> = {};

  @Ref()
  readonly formEl!: Form;

  get documentId(): string {
    return this.$route.params.id;
  }

  get documentIdentifier(): string {
    if (this.document) {
      if (this.form.name) {
        return this.form.name;
      }

      if (this.form.title) {
        return this.form.title;
      }

      if (this.form.identifier) {
        return this.form.identifier;
      }
    }

    return this.documentId;
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
    return this.schema?.title ?? '';
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
    if (this.localGroups && Object.keys(this.localGroups).length > 0) {
      return this.localGroups;
    }

    if (this.schema) {
      return this.schema.groups;
    }

    return {};
  }

  set groups(value: Record<string, string[]>) {
    this.localGroups = { ...value };
  }

  get availableTabs(): string[] {
    if (this.localGroups && Object.keys(this.localGroups).length > 0) {
      return Object.keys(this.localGroups);
    }

    if (this.schema) {
      return Object.keys(this.schema.groups);
    }

    return [];
  }

  get user(): string {
    return this.$store.getters[`${auth.namespace}/fullName`];
  }

  get allDocumentRevisions(): ManyResultSet<AllDocumentRevisionsResultItem> {
    const state: data.DataState = this.$store.state[data.namespace];

    return state.allDocumentRevisions;
  }

  get revisions(): AllDocumentRevisionsResultItem[] {
    return this.allDocumentRevisions.results.filter(revision => revision.id !== 'current');
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
      this.form = { ...this.form, ...cloneDeep(this.document.data) };
    }

    this.fields.forEach(field => {
      if (this.form[field.name] === undefined) {
        Vue.set(this.form, field.name, field.settings.default ?? null);
      }
    });

    this.$nextTick(() => {
      this.dirty = false;
    });
  }

  public async fetchSchemaById(): Promise<void> {
    try {
      this.loading += 1;

      await this.$store.dispatch(`${data.namespace}/fetchSchemaWithFieldsById`, {
        id: this.schemaId,
      });
    } catch (_) {
      this.$message({
        message:
          'An error occurred whilst fetching the schema for the document, please try again later.',
        type: 'error',
      });
    } finally {
      this.$nextTick(() => {
        this.loading -= 1;
      });
    }
  }

  public async fetchDocumentById(force = false): Promise<void> {
    try {
      this.loading += 1;

      await this.$store.dispatch(`${data.namespace}/fetchDocumentById`, {
        id: this.$route.params.id,
        force,
      });
    } catch (_) {
      this.$message({
        message: 'An error occurred when fetching the document, please try again later.',
        type: 'error',
      });
    } finally {
      this.$nextTick(() => {
        this.loading -= 1;
      });
    }
  }

  public async fetchAllDocumentRevisions(): Promise<void> {
    try {
      this.loading += 1;

      await this.$store.dispatch(`${data.namespace}/fetchAllDocumentRevisionsForDocument`, {
        documentId: this.documentId,
      });
    } catch (_) {
      this.$message({
        message:
          'An error occurred whilst fetching revisions for the document, please try again later.',
        type: 'error',
      });
    } finally {
      this.$nextTick(() => {
        this.loading -= 1;
      });
    }
  }

  public async submit(): Promise<void> {
    try {
      this.validationErrors = {};
      this.tabErrors = {};

      this.loading += 1;

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
    } catch (err) {
      if (err.graphQLErrors && err.graphQLErrors.length > 0) {
        const error: GraphQLError = err.graphQLErrors.pop();

        if (
          error.extensions &&
          error.extensions.code &&
          error.extensions.code === 'VALIDATION_ERROR'
        ) {
          const errors = error.extensions.errors;

          this.validationErrors = errors;

          const entries = Object.entries(errors);

          entries.forEach((entry: any): void => {
            const [key] = entry;
            const groupName = this.getGroupNameFromFieldName(key.split('.').shift());

            Vue.set(this.tabErrors, groupName, true);
          });

          entries.slice(0, 4).forEach((entry: any): void => {
            const [key, value] = entry;

            const groupName = this.getGroupNameFromFieldName(key.split('.').shift());

            setImmediate(() => {
              this.$message({
                message: `${groupName}: ${value}`,
                type: 'warning',
              });
            });
          });

          if (entries.length > 4) {
            setImmediate(() => {
              this.$message({
                message: `And ${entries.length - 4} more errors`,
                type: 'warning',
              });
            });
          }
        }
      } else {
        // It's any's all the way down
        const errors = (this.formEl as any).fields.filter(
          (f: any): boolean => f.validateState === 'error',
        );

        errors.forEach((f: any): void => {
          const groupName = this.getGroupNameFromFieldName(f.prop.split('.').shift());

          Vue.set(this.tabErrors, groupName, true);
        });

        errors.slice(0, 4).forEach((f: any): void => {
          const groupName = this.getGroupNameFromFieldName(f.prop.split('.').shift());

          setImmediate(() => {
            this.$message({
              message: `${groupName}: ${f.validateMessage}`,
              type: 'warning',
            });
          });
        });

        if (errors.length > 4) {
          setImmediate(() => {
            this.$message({
              message: `And ${errors.length - 4} more errors`,
              type: 'warning',
            });
          });
        }
      }
    } finally {
      this.$nextTick(() => {
        this.loading -= 1;
      });
    }
  }

  @Watch('documentId', { immediate: true })
  public async handleDocumentIdChange(): Promise<void> {
    this.ready = false;

    await this.fetchDocumentById();
    await this.fetchSchemaById();
    await this.fetchAllDocumentRevisions();

    this.initialiseForm();

    this.currentTab = this.availableTabs[0];

    this.ready = true;
  }

  @Watch('form', { deep: true })
  public handleFormChange(): void {
    this.dirty = true;
  }
}
</script>

<style lang="scss">
.update-document-page {
  width: 100%;

  .el-tabs__item {
    padding: 0 !important;
  }

  .el-tab-pane__label {
    padding: 0 20px;

    &.is-warning {
      color: #f56c6c;

      &::after {
        content: '*';
      }
    }
  }
}

.dockite-document--actions-drawer {
  width: 100%;
  height: 100vh;
  max-width: 350px;
  position: fixed;
  top: 0;
  right: 0;
  background: #ffffff;
  padding: 1rem 0;
  box-sizing: border-box;
}

.dockite-document--history-drawer {
  .el-drawer__body {
    overflow-y: auto;
  }
}

.dockite-document--history-hook {
  position: fixed;
  right: 0;
  top: 50%;
  background: #ffffff;
  border-top-left-radius: 7px;
  border-bottom-left-radius: 7px;
}
</style>
