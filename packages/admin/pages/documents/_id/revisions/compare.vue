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

    <div class="all-document-documents-page">
      <!-- eslint-disable-next-line -->
      <div v-html="diffHTML"></div>
    </div>
  </fragment>
</template>

<script lang="ts">
import { Document } from '@dockite/types';
import { formatDistanceToNow } from 'date-fns';
import { html } from 'diff2html';
import { Component, Vue, Watch, Ref } from 'nuxt-property-decorator';
import unidiff from 'unidiff';
import { Fragment } from 'vue-fragment';

import { ManyResultSet, AllDocumentRevisionsResultItem } from '~/common/types';
import { stableJSONStringify } from '~/common/utils';
import * as data from '~/store/data';

import 'diff2html/bundles/css/diff2html.min.css';

@Component({
  components: {
    Fragment,
  },
})
export default class DocumentRevisionsPage extends Vue {
  get primary(): string {
    return this.$route.query.from as string;
  }

  get secondary(): string {
    return this.$route.query.to as string;
  }

  public diffHTML = '';

  @Ref()
  readonly diffDetail!: HTMLTextAreaElement;

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

  public fetchAllDocumentRevisions(): void {
    this.$store.dispatch(`${data.namespace}/fetchAllDocumentRevisionsForDocument`, {
      documentId: this.documentId,
    });
  }

  public fetchDocumentById(force = false): Promise<void> {
    return this.$store.dispatch(`${data.namespace}/fetchDocumentById`, {
      id: this.$route.params.id,
      force,
    });
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
</style>
