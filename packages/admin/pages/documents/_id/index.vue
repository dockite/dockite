<template>
  <fragment>
    <portal to="header">
      <el-row type="flex" justify="space-between" align="middle">
        <h2>Update - {{ documentId }}</h2>

        <el-button
          type="text"
          style="font-size: 1.2rem;"
          title="Actions"
          @click="actionsDrawerVisible = true"
        >
          <i class="el-icon-d-arrow-left" />
        </el-button>
      </el-row>
    </portal>

    <div v-if="ready" class="update-document-page">
      <div style="padding-right: 350px;">
        <el-form ref="formEl" label-position="top" :model="form" @submit.native.prevent="submit">
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
              >
              </component>
            </el-tab-pane>
          </el-tabs>
        </el-form>
      </div>
      <div
        class="dockite-document--actions-drawer"
        :style="`padding-top: calc(1rem + ${heightOffset}px);`"
      >
        <div class="dockite-document--actions-drawer-body">
          <div class="dockite-document--actions-drawer-revisions">
            <h4>Recent changes</h4>
            <el-alert
              v-for="revision in revisions"
              :key="revision.id"
              style="margin-bottom: 0.75rem;"
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
            <el-alert v-if="revisions.length === 0" type="warning" show-icon :closable="false">
              <template slot="title">
                No changes yet!
              </template>
              Once changes occur they will appear here with a link to view the differences.
            </el-alert>
          </div>
          <!-- <el-button size="medium" type="danger" >
              Delete Document
            </el-button> -->
          <el-button size="medium">
            Save as Draft
          </el-button>
          <el-button type="primary" size="medium" @click="submit">
            Save and Publish
          </el-button>
        </div>
      </div>
    </div>
  </fragment>
</template>

<script lang="ts">
import { Schema, Field, Document } from '@dockite/types';
import { Form } from 'element-ui';
import { sortBy, cloneDeep } from 'lodash';
import { Component, Vue, Watch, Ref } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import { ManyResultSet, AllDocumentRevisionsResultItem } from '../../../common/types';

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

  public heightOffset = 80;

  public form: Record<string, any> = {};

  public ready = false;

  public actionsDrawerVisible = false;

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

  get allDocumentRevisions(): ManyResultSet<AllDocumentRevisionsResultItem> {
    const state: data.DataState = this.$store.state[data.namespace];

    return state.allDocumentRevisions;
  }

  get revisions(): AllDocumentRevisionsResultItem[] {
    return this.allDocumentRevisions.results.filter(revision => revision.id !== 'current');
  }

  created(): void {
    window.document.addEventListener('scroll', this.handleHeightOffset);
  }

  destroyed(): void {
    window.document.removeEventListener('scroll', this.handleHeightOffset);
  }

  public handleHeightOffset(): void {
    this.heightOffset = Math.max(0, 80 - window.pageYOffset);
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
      if (!this.form[field.name]) {
        Vue.set(this.form, field.name, null);
      }
    });
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

  public fetchAllDocumentRevisions(): void {
    this.$store.dispatch(`${data.namespace}/fetchAllDocumentRevisionsForDocument`, {
      documentId: this.documentId,
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
    await this.fetchAllDocumentRevisions();

    this.initialiseForm();

    this.currentTab = this.availableTabs[0];

    this.ready = true;
  }
}
</script>

<style lang="scss">
.update-document-page {
  width: 100%;
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

.dockite-document--actions-drawer-body {
  display: flex;
  flex-direction: column;

  height: 100%;

  padding: 0rem 20px 1rem 20px;

  .el-button + .el-button {
    margin-left: 0;
  }

  .el-button {
    margin-bottom: 0.75rem;
  }

  .el-button:last-child {
    margin-bottom: 0;
  }
}

.dockite-document--actions-drawer-revisions {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 1rem;
}
</style>
