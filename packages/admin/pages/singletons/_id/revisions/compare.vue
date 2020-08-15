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

    <div class="singleton-revision-compare-page el-loading-parent__min-height">
      <!-- eslint-disable-next-line -->
      <div
        :class="{ 'dockite-diff--highlight': highlight }"
        style="background: #ffffff; margin-bottom: 1rem;"
        v-html="diffHTML"
      />
      <el-button
        style="width: auto"
        class="dockite-button--restore"
        type="primary"
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
import { Singleton } from '@dockite/database';
import { formatDistanceToNow } from 'date-fns';
import { html } from 'diff2html';
import { Component, Vue, Watch, Ref } from 'nuxt-property-decorator';
import unidiff from 'unidiff';
import { Fragment } from 'vue-fragment';

import { ManyResultSet, AllSchemaRevisionsResultItem } from '~/common/types';
import { stableJSONStringify } from '~/common/utils';
import * as data from '~/store/data';
import * as revision from '~/store/revision';

import 'diff2html/bundles/css/diff2html.min.css';

@Component({
  components: {
    Fragment,
  },
})
export default class SingletonRevisionsPage extends Vue {
  public highlight = false;
  public diffHTML = '';

  @Ref()
  readonly diffDetail!: HTMLTextAreaElement;

  get primary(): string {
    return this.$route.query.from as string;
  }

  get secondary(): string {
    return this.$route.query.to as string;
  }

  get allSingletonRevisions(): ManyResultSet<AllSchemaRevisionsResultItem> {
    const state: data.DataState = this.$store.state[data.namespace];

    return state.allSchemaRevisions;
  }

  get primaryRevision(): string {
    const revision = this.allSingletonRevisions.results.find(
      revision => revision.id === this.primary,
    );

    if (revision) {
      return stableJSONStringify(revision.data);
    }

    return '';
  }

  get secondaryRevision(): string {
    const revision = this.allSingletonRevisions.results.find(
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

  get singleton(): Singleton {
    return this.$store.getters[`${data.namespace}/getSingletonWithFieldsById`](this.singletonId);
  }

  get singletonId(): string {
    return this.$route.params.id;
  }

  get currentPage(): number {
    if (!this.allSingletonRevisions.currentPage) {
      return 1;
    }

    return this.allSingletonRevisions.currentPage;
  }

  get totalPages(): number {
    if (!this.allSingletonRevisions.totalPages) {
      return 1;
    }

    return this.allSingletonRevisions.totalPages;
  }

  get totalItems(): number {
    if (!this.allSingletonRevisions.totalItems) {
      return 1;
    }

    return this.allSingletonRevisions.totalItems;
  }

  public fetchAllSingletonRevisions(): void {
    this.$store.dispatch(`${data.namespace}/fetchAllShcmeaRevisionsForShcmea`, {
      schemaId: this.singletonId,
    });
  }

  public fetchSingletonById(force = false): Promise<void> {
    return this.$store.dispatch(`${data.namespace}/fetchSingletonWithFieldsById`, {
      id: this.$route.params.id,
      force,
    });
  }

  public async restoreToRevision(revisionId: string): Promise<void> {
    try {
      await this.$store.dispatch(`${revision.namespace}/restoreSchemaRevision`, {
        revisionId,
        schemaId: this.singletonId,
      });

      this.$message({
        message: 'Revision restored successfully',
        type: 'success',
      });

      this.$router.replace(`/singletons/${this.singletonId}`);
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

  @Watch('singletonId', { immediate: true })
  handleSingletonIdChange(): void {
    this.fetchSingletonById();
    this.fetchAllSingletonRevisions();
  }

  @Watch('allSingletonRevisions', { immediate: true })
  handleSingletonRevisionsChange(): void {
    if (this.allSingletonRevisions.results.length > 0) {
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
.all-singleton-singletons-page {
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
