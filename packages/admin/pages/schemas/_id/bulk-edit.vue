<template>
  <div>
    <portal to="header">
      <el-row type="flex" justify="space-between" align="middle">
        <h2>{{ schemaName }} - Bulk Edit</h2>

        <div>
          <el-button @click="showDocumentSelectModal = true">
            {{ selectedDocuments.length === 0 ? 'Select Documents' : 'Update Selection' }}
          </el-button>

          <el-button @click="selectAll = !selectAll">
            {{ selectAll ? 'Deselect All' : 'Select All' }}
          </el-button>

          <el-button
            :disabled="loading > 0 || (selectedDocuments.length === 0 && !selectAll)"
            type="primary"
            @click="submit"
          >
            Update ({{ documentCount }})
          </el-button>
        </div>
      </el-row>
    </portal>

    <el-alert type="warning" title="Bulk Edit Warning" show-icon>
      Field validation will not be performed during a bulk edit due to not knowing if a state is
      valid for all documents that will be edited. Please ensure that data provided is valid and
      correct.
    </el-alert>

    <div
      v-loading="loading > 0"
      class="create-schema-document-page pt-2 el-loading-parent__min-height"
    >
      <el-form
        v-if="ready"
        ref="formEl"
        label-position="top"
        :model="form"
        @submit.native.prevent="submit"
      >
        <el-tabs v-model="currentTab" type="border-card">
          <el-tab-pane v-for="tab in availableTabs" :key="tab" :label="tab" :name="tab">
            <div v-for="field in getFieldsByGroupName(tab)" :key="field.id">
              <div
                v-if="
                  $dockiteFieldManager[field.type].input &&
                    !(field.settings.hidden || field.settings.hideInBulkEdit)
                "
                class="flex justify-between items-center -mx-3 my-3"
              >
                <div class="w-full px-3 relative">
                  <component
                    :is="$dockiteFieldManager[field.type].input"
                    v-model="form[field.name]"
                    :bulk-edit-mode="true"
                    :name="field.name"
                    :errors="validationErrors"
                    :field-config="field"
                    :form-data="form"
                    :schema="schema"
                    :groups.sync="groups"
                  />

                  <transition name="el-fade-in">
                    <div
                      v-show="!enabledFields[field.name]"
                      class="absolute w-full h-full top-0 left-0 bg-gray-200 rounded flex flex-col items-center justify-center"
                      style="opacity: 0.8"
                    >
                      <i class="el-icon-lock" style="font-size: 2.5rem;" />
                      <span class="py-1 ">{{ field.title }}</span>
                    </div>
                  </transition>
                </div>

                <div class="px-3">
                  <el-switch
                    v-model="enabledFields[field.name]"
                    class="flex-1"
                    active-text="Update"
                  />
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <el-row type="flex" justify="space-between" align="middle" style="margin-top: 1rem;">
        <el-button type="text" @click="$router.go(-1)">
          Cancel
        </el-button>

        <el-button
          :disabled="loading > 0 || (selectedDocuments.length === 0 && !selectAll)"
          type="primary"
          @click="submit"
        >
          Update ({{ documentCount }})
        </el-button>
      </el-row>
    </div>

    <document-select-modal
      :visible.sync="showDocumentSelectModal"
      :selected-documents.sync="selectedDocuments"
      @select-all="selectAll = true"
    />
  </div>
</template>

<script lang="ts">
import { Schema, Field, Document } from '@dockite/database';
import { Form } from 'element-ui';
import { sortBy, pickBy } from 'lodash';
import { Component, Vue, Watch, Ref } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import Logo from '~/components/base/logo.vue';
import DocumentSelectModal from '~/components/schema/document-select-modal.vue';
import * as auth from '~/store/auth';
import * as data from '~/store/data';
import * as document from '~/store/document';
import * as ui from '~/store/ui';

@Component({
  components: {
    DocumentSelectModal,
    Fragment,
    Logo,
  },
})
export default class CreateSchemaDocumentPage extends Vue {
  public currentTab = 'Default';

  public form: Record<string, any> = {};

  public ready = false;

  public loading = 0;

  public selectAll = false;

  public selectedDocuments: Document[] = [];

  public enabledFields: Record<string, boolean> = {};

  public showDocumentSelectModal = false;

  public localGroups: Record<string, string[]> | null = null;

  public validationErrors: Record<string, string> = {};

  @Ref()
  readonly formEl!: Form;

  get schemaId(): string {
    return this.$route.params.id;
  }

  get schemaName(): string {
    return this.schema?.title ?? '';
  }

  get schema(): Schema | null {
    return this.$store.getters[`${data.namespace}/getSchemaWithFieldsById`](this.schemaId);
  }

  get documentCount(): string | number {
    if (this.selectAll) {
      return 'ALL';
    }

    return this.selectedDocuments.length;
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
    if (this.schema) {
      return Object.keys(this.schema.groups);
    }

    return [];
  }

  get user(): string {
    return this.$store.getters[`${auth.namespace}/fullName`];
  }

  public getFieldsByGroupName(name: string): Field[] {
    const filteredFields = this.fields.filter(field =>
      (this.groups[name] ?? []).includes(field.name),
    );

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
    this.fields.forEach(field => {
      Vue.set(this.enabledFields, field.name, false);

      if (this.form[field.name] === undefined) {
        Vue.set(this.form, field.name, field.settings.default ?? null);
      }
    });
  }

  public async fetchSchemaById(force = false): Promise<void> {
    try {
      this.loading += 1;

      await this.$store.dispatch(`${data.namespace}/fetchSchemaWithFieldsById`, {
        id: this.$route.params.id,
        force,
      });
    } catch (_) {
      this.$message({
        message: 'Unable to fetch schema: ' + this.schemaId,
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
      this.loading += 1;

      const payload: Record<string, any> = {
        data: pickBy(this.form, (_, key) => this.enabledFields[key] === true),
        schemaId: this.schemaId,
      };

      if (!this.selectAll) {
        payload.documentIds = this.selectedDocuments.map(x => x.id);
      }

      await this.$store.dispatch(`${document.namespace}/partialUpdateDocumentsInSchemaId`, payload);

      this.$message({
        message: 'Bulk Edit completed successfully',
        type: 'success',
      });

      this.$store.commit(`${ui.namespace}/clearItemsForBulkEdit`);

      this.$router.push(`/schemas/${this.schemaId}`);
    } catch (_) {
      // It's any's all the way down
      const errors = (this.formEl as any).fields.filter(
        (f: any): boolean => f.validateState === 'error',
      );

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

      if (errors.length === 0) {
        this.$message({
          message: `An error occured during the bulk edit, please try again later.`,
          type: 'error',
        });
      }
    } finally {
      this.$nextTick(() => {
        this.loading -= 1;
      });
    }
  }

  @Watch('schamaId', { immediate: true })
  public async handleSchemaIdChange(): Promise<void> {
    this.loading += 1;
    this.ready = false;

    await this.fetchSchemaById();
    this.initialiseForm();
    this.currentTab = this.availableTabs[0];

    this.$nextTick(() => {
      this.loading -= 1;
    });

    this.ready = true;
  }

  beforeMount(): void {
    const state = this.$store.state[ui.namespace] as ui.UiState;

    if (state.itemsForBulkEdit.length > 0 && state.itemsForBulkEditSchemaId === this.schemaId) {
      this.selectedDocuments = state.itemsForBulkEdit;
    }
  }
}
</script>

<style></style>
