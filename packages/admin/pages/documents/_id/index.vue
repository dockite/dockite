<template>
  <fragment>
    <portal to="header">
      <el-row type="flex" justify="space-between" align="middle">
        <h2>
          <span class="font-bold">Update {{ schema && schema.title }}:</span>
          {{ documentIdentifier }}
        </h2>

        <div>
          <document-actions-dropdown
            v-if="schema && document"
            class="ml-2"
            :disabled="dirty"
            :document="document"
            :document-id="documentId"
            :schema="schema"
            :handle-save-and-publish="submit"
          />
        </div>
      </el-row>
    </portal>

    <div v-loading="loading > 0" class="update-document-page el-loading-parent__min-height">
      <div>
        <document-form
          v-if="schema && document"
          ref="formEl"
          v-model="form"
          :data="document.data"
          :schema="schema"
          :dirty.sync="dirty"
          :handle-submit="updateDocument"
        />
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
import { Schema, Document } from '@dockite/database';
import { Component, Vue, Watch, Ref } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import { ManyResultSet, AllDocumentRevisionsResultItem } from '../../../common/types';

import DocumentForm from '~/components/base/document-form.vue';
import Logo from '~/components/base/logo.vue';
import DocumentActionsDropdown from '~/components/documents/actions-dropdown.vue';
import * as auth from '~/store/auth';
import * as data from '~/store/data';
import * as document from '~/store/document';

@Component({
  components: {
    DocumentActionsDropdown,
    DocumentForm,
    Fragment,
    Logo,
  },
})
export default class UpdateDocumentPage extends Vue {
  public form: Record<string, any> = {};

  public ready = false;

  public loading = 0;

  public showHistoryDrawer = false;

  public actionsDrawerVisible = false;

  public dirty = false;

  @Ref()
  readonly formEl!: any;

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

  public async updateDocument(): Promise<void> {
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
  }

  public async submit(): Promise<void> {
    try {
      this.loading += 1;

      await this.formEl.submit();
    } catch (_) {
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

    this.ready = true;
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
