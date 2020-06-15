<template>
  <fragment>
    <portal to="header">
      <el-row style="width: 100%" type="flex" justify="space-between" align="middle">
        <h2>
          Revisions - <strong>{{ documentId }}</strong>
        </h2>
      </el-row>
    </portal>

    <div class="all-document-documents-page">
      <el-table :data="allDocumentRevisions.results" style="width: 100%">
        <el-table-column prop="id" label="ID">
          <template slot-scope="scope">
            {{ scope.row.id.slice(0, 8) + '...' }}
          </template>
        </el-table-column>

        <el-table-column prop="user.email" label="Updated By" />
        <el-table-column prop="createdAt" label="Created" :formatter="cellValueFromNow" />

        <el-table-column label="From">
          <template slot-scope="scope">
            <el-radio v-model="primary" :label="scope.row.id">
              <!-- Without this is will default to displaying the label -->
              <div />
            </el-radio>
          </template>
        </el-table-column>

        <el-table-column label="To">
          <template slot-scope="scope">
            <el-radio v-model="secondary" :label="scope.row.id">
              <!-- Without this is will default to displaying the label -->
              <div />
            </el-radio>
          </template>
        </el-table-column>

        <el-table-column label="Actions">
          <template slot-scope="scope">
            <el-button type="text" @click="revisionToDisplay = scope.row.data">
              <i class="el-icon-view" />
            </el-button>

            <el-button
              v-if="scope.row.id !== 'current'"
              type="text"
              title="Restore to this revision"
              @click="restoreToRevision(scope.row.id)"
            >
              <i class="el-icon-refresh-left" />
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-row type="flex" justify="space-between" align="middle">
        <el-pagination
          :current-page="currentPage"
          class="dockite-element--pagination"
          :page-count="totalPages"
          :pager-count="5"
          :page-size="20"
          :total="totalItems"
          layout="total"
        />
        <div style="padding: 0 1rem;">
          <router-link
            :to="`/documents/${documentId}/revisions/compare?from=${primary}&to=${secondary}`"
          >
            <el-button :disabled="!canCompare" type="primary" @click="showDiff = true">
              Compare
            </el-button>
          </router-link>
        </div>
      </el-row>

      <el-dialog
        title="Revision Details"
        custom-class="dockite-dialog--revision-detail"
        :visible="revisionToDisplay !== null"
        :destroy-on-close="true"
        @close="revisionToDisplay = null"
      >
        <textarea
          ref="revisionDetail"
          :value="JSON.stringify(revisionToDisplay, null, 2)"
        ></textarea>
      </el-dialog>
    </div>
  </fragment>
</template>

<script lang="ts">
import { Document } from '@dockite/types';
import CodeMirror from 'codemirror';
import { formatDistanceToNow } from 'date-fns';
import { Component, Vue, Watch, Ref } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import { ManyResultSet, AllDocumentRevisionsResultItem } from '../../../common/types';

import 'codemirror/addon/merge/merge.css';
import 'codemirror/addon/merge/merge.js';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/theme/nord.css';

import * as data from '~/store/data';
import * as revision from '~/store/revision';

// That is horrifying
const stableJSONStringify = (obj: any, space = 2): string => {
  const keys = [];

  JSON.stringify(obj, (key, value) => {
    keys.push(key);
    return value;
  });

  keys.sort();

  return JSON.stringify(obj, keys, space);
};

@Component({
  components: {
    Fragment,
  },
})
export default class DocumentRevisionsPage extends Vue {
  public primary: string | null = null;

  public secondary: string | null = null;

  public revisionToDisplay: any | null = null;

  public showDiff = false;

  @Ref()
  readonly revisionDetail!: HTMLTextAreaElement;

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

  public async restoreToRevision(revisionId: string): Promise<void> {
    try {
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

  @Watch('revisionToDisplay', { immediate: true })
  handleRevisionToDisplayChange(): void {
    if (this.revisionToDisplay !== null) {
      this.$nextTick(() => {
        CodeMirror.fromTextArea(this.revisionDetail, {
          mode: 'application/json',
          tabSize: 2,
          lineNumbers: true,
          lineWrapping: true,
          theme: 'nord',
        });
      });
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
