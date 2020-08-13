<template>
  <fragment>
    <portal to="header">
      <h2>
        Delete
        <strong>
          {{ documentId }}
        </strong>
      </h2>
    </portal>

    <div v-loading="loading > 0" class="delete-document-page">
      <el-card>
        <template slot="header">
          <h3>Are you sure you want to delete {{ documentId }}?</h3>
        </template>
        <div class="dockite-document--detail">
          <el-collapse>
            <el-collapse-item title="Details">
              <pre class="dockite-data--raw">{{ documentRaw }}</pre>
            </el-collapse-item>
          </el-collapse>
        </div>
        <el-row type="flex" justify="space-between">
          <el-button @click.prevent="$router.go(-1)">
            Cancel
          </el-button>
          <el-button
            v-if="schema && $can(`schema:${schema.name}:delete`)"
            :disabled="loading > 0"
            type="danger"
            @click="handleDeleteDocument"
          >
            Delete
          </el-button>
        </el-row>
      </el-card>
    </div>
  </fragment>
</template>

<script lang="ts">
import { Document, Schema } from '@dockite/database';
import { Component, Vue, Watch } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import * as data from '~/store/data';
import * as document from '~/store/document';

@Component({
  components: {
    Fragment,
  },
})
export default class EditDocumentPage extends Vue {
  public loading = 0;

  get document(): Document | null {
    return this.$store.getters[`${data.namespace}/getDocumentById`](this.documentId);
  }

  get documentRaw(): string {
    return JSON.stringify(this.document, null, 2);
  }

  get documentId(): string {
    return this.$route.params.id;
  }

  get schemaId(): string | null {
    if (this.document) {
      return this.document.schemaId;
    }

    return null;
  }

  get schema(): Schema | null {
    return this.$store.getters[`${data.namespace}/getSchemaWithFieldsById`](this.schemaId);
  }

  public async fetchDocumentById(): Promise<void> {
    try {
      this.loading += 1;

      await this.$store.dispatch(`${data.namespace}/fetchDocumentById`, { id: this.documentId });
    } catch (_) {
      this.$message({
        message: 'An error occurred when fetching the document, please try again later.',
        type: 'error',
      });
    } finally {
      this.loading -= 1;
    }
  }

  public async fetchSchemaById(): Promise<void> {
    try {
      this.loading += 1;

      await this.$store.dispatch(`${data.namespace}/fetchSchemaWithFieldsById`, {
        id: this.schemaId,
      });
    } catch (_) {
      this.$message({
        message: 'An error occurred when fetching the document, please try again later.',
        type: 'error',
      });
    } finally {
      this.loading -= 1;
    }
  }

  public async handleDeleteDocument(): Promise<void> {
    try {
      this.loading += 1;

      await this.$store.dispatch(`${document.namespace}/deleteDocument`, {
        documentId: this.documentId,
        schemaId: this.document?.schemaId,
      });

      this.$message({
        message: 'Document deleted successfully',
        type: 'success',
      });

      this.$router.push(`/schemas/${this.document?.schemaId}`);
    } catch (_) {
      this.$message({
        message: 'An error occurred when deleting the document, please try again later.',
        type: 'error',
      });
    } finally {
      this.loading -= 1;
    }
  }

  @Watch('documentId', { immediate: true })
  async handleDocumentIdChange(): Promise<void> {
    await this.fetchDocumentById();
    await this.fetchSchemaById();
  }
}
</script>

<style lang="scss">
.dockite-element--pagination {
  /* background: #ffffff; */
  background: transparent;

  li {
    background: transparent;
  }

  button {
    background: transparent;
  }
}

.dockite-document--detail {
  padding-bottom: 1.5rem;
}
</style>
