<!-- eslint-disable vue/no-v-html -->
<template>
  <fragment>
    <portal to="header">
      <el-row style="width: 100%" type="flex" justify="space-between" align="middle">
        <h2>
          Comparing <strong>{{ $route.query.from }}</strong> against
          <strong>{{ $route.query.to }}</strong>
        </h2>
      </el-row>
    </portal>

    <div
      v-loading="loading > 0"
      class="document-revision-compare-page el-loading-parent__min-height"
    >
      <div
        :class="{ 'dockite-diff--highlight': highlight }"
        style="background: #ffffff; margin-bottom: 1rem;"
        v-html="diffHTML"
      />

      <el-button
        v-if="$can('internal:document:update')"
        style="width: auto"
        class="dockite-button--restore"
        type="primary"
        :disabled="loading > 0"
        @click="restoreToRevision(primary)"
        @mouseover.native="highlight = true"
        @mouseleave.native="highlight = false"
      >
        Restore to {{ primary.slice(0, 8) }}
      </el-button>
    </div>
  </fragment>
</template>

<script lang="ts">
import { Document } from '@dockite/database';
import { formatDistanceToNow } from 'date-fns';
import { html } from 'diff2html';
import { Component, Vue, Watch, Ref } from 'nuxt-property-decorator';
import unidiff from 'unidiff';
import { Fragment } from 'vue-fragment';

import { ManyResultSet, AllDocumentRevisionsResultItem } from '~/common/types';
import { stableJSONStringify } from '~/common/utils';
import * as data from '~/store/data';
import * as revision from '~/store/revision';

import 'diff2html/bundles/css/diff2html.min.css';

@Component({
  components: {
    Fragment,
  },
})
export default class DocumentRevisionsPage extends Vue {
  public highlight = false;

  public diffHTML = '';

  public loading = 0;

  @Ref()
  readonly diffDetail!: HTMLTextAreaElement;

  get primary(): string {
    return this.$route.query.from as string;
  }

  get secondary(): string {
    return this.$route.query.to as string;
  }

  get allDocumentRevisions(): ManyResultSet<AllDocumentRevisionsResultItem> {
    const state: data.DataState = this.$store.state[data.namespace];

    return state.allDocumentRevisions;
  }

  get primaryRevision(): string {
    const revision = this.allDocumentRevisions.results.find(
      revision => revision.id === this.primary,
    );

    if (revision) {
      return stableJSONStringify(revision.data);
    }

    return '';
  }

  get secondaryRevision(): string {
    const revision = this.allDocumentRevisions.results.find(
      revision => revision.id === this.secondary,
    );

    if (revision) {
      return stableJSONStringify(revision.data);
    }

    return '';
  }

  get canCompare(): boolean {
    return this.primary !== null && this.secondary !== null && this.primary !== this.secondary;
  }

  get document(): Document {
    return this.$store.getters[`${data.namespace}/getDocumentWithFieldsById`](this.documentId);
  }

  get documentId(): string {
    return this.$route.params.id;
  }

  get currentPage(): number {
    if (!this.allDocumentRevisions.currentPage) {
      return 1;
    }

    return this.allDocumentRevisions.currentPage;
  }

  get totalPages(): number {
    if (!this.allDocumentRevisions.totalPages) {
      return 1;
    }

    return this.allDocumentRevisions.totalPages;
  }

  get totalItems(): number {
    if (!this.allDocumentRevisions.totalItems) {
      return 1;
    }

    return this.allDocumentRevisions.totalItems;
  }

  public async fetchAllDocumentRevisions(): Promise<void> {
    this.loading += 1;

    await this.$store.dispatch(`${data.namespace}/fetchAllDocumentRevisionsForDocument`, {
      documentId: this.documentId,
    });

    this.$nextTick(() => {
      this.loading -= 1;
    });
  }

  public fetchDocumentById(force = false): Promise<void> {
    return this.$store.dispatch(`${data.namespace}/fetchDocumentById`, {
      id: this.$route.params.id,
      force,
    });
  }

  public async restoreToRevision(revisionId: string): Promise<void> {
    try {
      this.loading += 1;

      await this.$store.dispatch(`${revision.namespace}/restoreDocumentRevision`, {
        revisionId,
        documentId: this.documentId,
      });

      this.$message({
        message: 'Revision restored successfully',
        type: 'success',
      });

      this.$router.replace(`/documents/${this.documentId}`);
    } catch (err) {
      this.$message({
        message: 'Revision was unable to be restored',
        type: 'error',
      });
    } finally {
      this.$nextTick(() => {
        this.loading -= 1;
      });
    }
  }

  public cellValueFromNow(_row: never, _column: never, cellValue: string, _index: never): string {
    return formatDistanceToNow(new Date(cellValue)) + ' ago';
  }

  @Watch('documentId', { immediate: true })
  handleDocumentIdChange(): void {
    this.fetchDocumentById();
    this.fetchAllDocumentRevisions();
  }

  @Watch('allDocumentRevisions', { immediate: true })
  handleDocumentRevisionsChange(): void {
    if (this.allDocumentRevisions.results.length > 0) {
      this.diffHTML = html(
        unidiff.formatLines(unidiff.diffLines(this.primaryRevision, this.secondaryRevision), {
          context: Infinity,
          aname: this.primary,
          bname: this.secondary,
        }),
        {
          drawFileList: false,
          outputFormat: 'side-by-side',
          renderNothingWhenEmpty: false,
        },
      );
    }
  }
}
</script>

<style lang="scss">
.all-document-documents-page {
  background: #ffffff;
}

.dockite-element--pagination {
  padding: 1rem;
}

.dockite-dialog--revision-detail {
  width: 80%;
  max-width: 1000px;
}

.dockite-diff--highlight {
  .d2h-file-side-diff:first-of-type {
    background: #ffffed;
  }
}
</style>
