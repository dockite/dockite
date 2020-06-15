<template>
  <fragment>
    <portal to="header">
      <el-row style="width: 100%" type="flex" justify="space-between" align="middle">
        <h2>
          Revisions - <strong>{{ schemaName }}</strong>
        </h2>
      </el-row>
    </portal>

    <div class="all-schema-documents-page">
      <el-table :data="allSchemaRevisions.results" style="width: 100%">
        <el-table-column prop="id" label="ID">
          <template slot-scope="scope">
            {{ scope.row.id.slice(0, 8) + '...' }}
          </template>
        </el-table-column>

        <el-table-column prop="user.email" label="Updated By" />
        <el-table-column prop="createdAt" label="Created" :formatter="cellValueFromNow" />

        <el-table-column label="Primary">
          <template slot-scope="scope">
            <el-radio v-model="primary" :label="scope.row.id">
              <!-- Without this is will default to displaying the label -->
              <div />
            </el-radio>
          </template>
        </el-table-column>

        <el-table-column label="Secondary">
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
          <el-button :disabled="!canCompare" type="primary" @click="showDiff = true">
            Compare
          </el-button>
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

      <el-dialog
        title="Revision Details"
        custom-class="dockite-dialog--revision-detail"
        :visible="showDiff"
        :destroy-on-close="true"
        @close="showDiff = false"
      >
        <div ref="diffDetail" />
      </el-dialog>
    </div>
  </fragment>
</template>

<script lang="ts">
import { Schema } from '@dockite/types';
import CodeMirror from 'codemirror';
import { formatDistanceToNow } from 'date-fns';
import DiffMatchPatch from 'diff-match-patch';
import { sortBy } from 'lodash';
import { Component, Vue, Watch, Ref } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import { ManyResultSet, AllSchemaRevisionsResultItem } from '../../../common/types';

import 'codemirror/addon/merge/merge.css';
import 'codemirror/addon/merge/merge.js';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/theme/nord.css';

import * as data from '~/store/data';

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
export default class SchemaRevisionsPage extends Vue {
  public primary: string | null = null;

  public secondary: string | null = null;

  public revisionToDisplay: any | null = null;

  public showDiff = false;

  @Ref()
  readonly revisionDetail!: HTMLTextAreaElement;

  @Ref()
  readonly diffDetail!: HTMLTextAreaElement;

  get allSchemaRevisions(): ManyResultSet<AllSchemaRevisionsResultItem> {
    const state: data.DataState = this.$store.state[data.namespace];

    return state.allSchemaRevisions;
  }

  get primaryRevision(): string {
    const revision = this.allSchemaRevisions.results.find(revision => revision.id === this.primary);

    if (revision) {
      return stableJSONStringify(revision.data);
    }

    return '';
  }

  get secondaryRevision(): string {
    const revision = this.allSchemaRevisions.results.find(
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

  get schema(): Schema {
    return this.$store.getters[`${data.namespace}/getSchemaWithFieldsById`](this.schemaId);
  }

  get schemaId(): string {
    return this.$route.params.id;
  }

  get schemaName(): string {
    return this.schema?.name ?? '';
  }

  get currentPage(): number {
    if (!this.allSchemaRevisions.currentPage) {
      return 1;
    }

    return this.allSchemaRevisions.currentPage;
  }

  get totalPages(): number {
    if (!this.allSchemaRevisions.totalPages) {
      return 1;
    }

    return this.allSchemaRevisions.totalPages;
  }

  get totalItems(): number {
    if (!this.allSchemaRevisions.totalItems) {
      return 1;
    }

    return this.allSchemaRevisions.totalItems;
  }

  public fetchAllSchemaRevisions(): void {
    this.$store.dispatch(`${data.namespace}/fetchAllSchemaRevisionsForSchema`, {
      schemaId: this.schemaId,
    });
  }

  public fetchSchemaWithFields(): void {
    this.$store.dispatch(`${data.namespace}/fetchSchemaWithFieldsById`, {
      id: this.schemaId,
    });
  }

  public fetchSearchDocumentsWithSchema(term: string, page = 1): void {
    this.$store.dispatch(`${data.namespace}/fetchSearchDocumentsWithSchema`, {
      term,
      page,
      schemaId: this.schemaId,
    });
  }

  public cellValueFromNow(_row: never, _column: never, cellValue: string, _index: never): string {
    return formatDistanceToNow(new Date(cellValue)) + ' ago';
  }

  created(): void {
    const win = window as any;

    if (!win.diff_match_patch) {
      win.diff_match_patch = DiffMatchPatch;
      win.DIFF_DELETE = -1;
      win.DIFF_INSERT = 1;
      win.DIFF_EQUAL = 0;
    }
  }

  destroyed(): void {
    const win = window as any;

    delete win.diff_match_patch;
    delete win.DIFF_DELETE;
    delete win.DIFF_INSERT;
    delete win.DIFF_EQUAL;
  }

  @Watch('schemaId', { immediate: true })
  handleSchemaIdChange(): void {
    this.fetchSchemaWithFields();
    this.fetchAllSchemaRevisions();
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

  @Watch('showDiff', { immediate: true })
  handleShowDiffChange(): void {
    if (this.showDiff) {
      this.$nextTick(() => {
        CodeMirror.MergeView(this.diffDetail, {
          value: this.primaryRevision,
          origRight: this.secondaryRevision,
          showDifferences: true,
          readOnly: true,
          mode: 'application/json',
        });
      });
    }
  }
}
</script>

<style lang="scss">
.all-schema-documents-page {
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
