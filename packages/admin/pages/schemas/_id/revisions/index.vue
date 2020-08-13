<template>
  <fragment>
    <portal to="header">
      <el-row style="width: 100%" type="flex" justify="space-between" align="middle">
        <h2>
          Revisions - <strong>{{ schema && schema.title }}</strong>
        </h2>
      </el-row>
    </portal>

    <div v-loading="loading > 0" class="all-schema-schemas-page">
      <el-table :data="allSchemaRevisions.results" style="width: 100%">
        <el-table-column prop="id" label="ID">
          <template slot-scope="scope">
            {{ scope.row.id | shortDesc }}
          </template>
        </el-table-column>

        <el-table-column prop="user.email" label="Updated By" />
        <el-table-column prop="createdAt" label="Created" :formatter="cellValueFromNow" />

        <el-table-column label="From">
          <template slot-scope="scope">
            <el-radio v-if="scope.row.id !== 'current'" v-model="primary" :label="scope.row.id">
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
          <span slot-scope="scope" class="dockite-table--actions">
            <el-button title="View Data" type="text" @click="revisionToDisplay = scope.row.data">
              <i class="el-icon-view" />
            </el-button>

            <el-button
              v-if="scope.row.id !== 'current'"
              type="text"
              title="Restore to this revision"
              :disabled="loading > 0"
              @click="restoreToRevision(scope.row.id)"
            >
              <i class="el-icon-refresh-left" />
            </el-button>
          </span>
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
            :to="`/schemas/${schemaId}/revisions/compare?from=${primary}&to=${secondary}`"
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
import { Schema } from '@dockite/database';
import CodeMirror from 'codemirror';
import { formatDistanceToNow } from 'date-fns';
import { Component, Vue, Watch, Ref } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import { ManyResultSet, AllSchemaRevisionsResultItem } from '~/common/types';
import { stableJSONStringify } from '~/common/utils';
import * as data from '~/store/data';
import * as revision from '~/store/revision';

import 'codemirror/addon/merge/merge.css';
import 'codemirror/addon/merge/merge.js';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/theme/nord.css';

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

  public loading = 0;

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

  public async fetchAllSchemaRevisions(): Promise<void> {
    try {
      this.loading += 1;

      await this.$store.dispatch(`${data.namespace}/fetchAllSchemaRevisionsForSchema`, {
        schemaId: this.schemaId,
      });
    } catch (_) {
      this.$message({
        message:
          'Unable to fetch revisions for ' + (this.schema && this.schema.name) || this.schemaId,
        type: 'error',
      });
    } finally {
      this.loading -= 1;
    }
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
      this.loading -= 1;
    }
  }

  public async restoreToRevision(revisionId: string): Promise<void> {
    try {
      this.loading += 1;

      await this.$store.dispatch(`${revision.namespace}/restoreSchemaRevision`, {
        revisionId,
        schemaId: this.schemaId,
      });

      this.$message({
        message: 'Revision restored successfully',
        type: 'success',
      });

      this.$router.replace(`/schemas/${this.schemaId}`);
    } catch (err) {
      this.$message({
        message: 'Revision was unable to be restored',
        type: 'error',
      });
    } finally {
      this.loading -= 1;
    }
  }

  public cellValueFromNow(_row: never, _column: never, cellValue: string, _index: never): string {
    return formatDistanceToNow(new Date(cellValue)) + ' ago';
  }

  @Watch('schemaId', { immediate: true })
  handleSchemaIdChange(): void {
    this.fetchSchemaById();
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
}
</script>

<style lang="scss">
.all-schema-schemas-page {
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
