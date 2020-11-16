<template>
  <fragment>
    <portal to="header">
      <el-row type="flex" align="middle" justify="space-between">
        <h2>New Draft: {{ name }}</h2>

        <el-button :type="dirty ? 'primary' : undefined" @click="handleCreateDraft">
          Create Draft
        </el-button>
      </el-row>
    </portal>

    <div class="document-drafts-create-page">
      <el-form label-position="top">
        <el-form-item label="Draft Name">
          <el-input v-model="name" class="w-full" />
        </el-form-item>
      </el-form>

      <document-form
        v-if="schema && document"
        ref="formEl"
        v-model="form"
        :schema="schema"
        :dirty.sync="dirty"
        :handle-submit="() => {}"
      />
    </div>
  </fragment>
</template>

<script lang="ts">
import { Document, Schema } from '@dockite/database';
import { cloneDeep } from 'lodash';
import { Component, Watch, Vue } from 'nuxt-property-decorator';

import DocumentForm from '~/components/base/document-form.vue';
import * as auth from '~/store/auth';
import * as data from '~/store/data';
import * as document from '~/store/document';

@Component({
  name: 'DocumentDraftCreatePage',
  components: {
    DocumentForm,
  },
})
export default class DocumentDraftCreatePage extends Vue {
  public name = '';

  public form: Record<string, any> = {};

  public loading = 1;

  public dirty = false;

  get documentId(): string {
    return this.$route.params.id;
  }

  get document(): Document | null {
    return this.$store.getters[`${data.namespace}/getDocumentById`](this.documentId);
  }

  get schema(): Schema | null {
    if (this.document) {
      return this.$store.getters[`${data.namespace}/getSchemaWithFieldsById`](
        this.document.schemaId,
      );
    }

    return null;
  }

  public async fetchDocumentById(force = false): Promise<void> {
    try {
      this.loading += 1;

      await this.$store.dispatch(`${data.namespace}/fetchDocumentById`, {
        id: this.documentId,
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

  public async fetchSchemaById(schemaId: string): Promise<void> {
    try {
      this.loading += 1;

      await this.$store.dispatch(`${data.namespace}/fetchSchemaWithFieldsById`, {
        id: schemaId,
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

  public async bootstrapDraft(): Promise<void> {
    try {
      this.loading += 1;

      await this.fetchDocumentById();
      await this.fetchSchemaById(this.document.schemaId);

      await this.$confirm("Would you like to use the current document's data?", 'Bootstrap', {
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        type: 'info',
      })
        .then(() => {
          if (this.document) {
            this.form = { ...this.form, ...cloneDeep(this.document.data) };
          }
        })
        .catch(() => {});
    } catch (err) {
      this.$message({
        message: 'An error occurred whilst bootstrapping the draft, please try again later.',
        type: 'error',
      });
    } finally {
      this.loading -= 1;
    }
  }

  public async handleCreateDraft(): Promise<void> {
    // ! TO BE IMPLEMENTED
  }

  beforeMount(): void {
    this.bootstrapDraft();

    this.loading -= 1;
  }
}
</script>

<style></style>
