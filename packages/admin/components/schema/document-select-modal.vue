<template>
  <el-dialog
    custom-class="dockite-document-select--modal"
    title="Select Documents"
    lock-scroll
    append-to-body
    :visible.sync="visibleSync"
  >
    <div>
      <div class="sticky bg-white top-0 flex z-10 flex-row justify-between items-center py-3">
        <el-button size="medium" @click="handleSelectAll">
          Select All
        </el-button>

        <portal-target name="header-extra" />
      </div>

      <table-view :selected-items.sync="selectedDocumentsSync" :selectable="true" />
    </div>

    <template slot="footer">
      <div class="pt-3">
        <el-button type="primary" @click="visibleSync = false">
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { Schema } from '@dockite/database';
import { startCase } from 'lodash';
import { Component, Vue, PropSync } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import FilterInput from '~/components/base/filter-input.vue';
import TableView from '~/components/schemas/views/table-view.vue';
import TreeView from '~/components/schemas/views/tree-view.vue';
import * as data from '~/store/data';

@Component({
  components: {
    Fragment,
    FilterInput,
    TableView,
    TreeView,
  },
})
export default class SchemaDocumentsPage extends Vue {
  public currentView = 'table-view';

  public startCase = startCase;

  @PropSync('visible')
  public visibleSync!: boolean;

  @PropSync('selectedDocuments')
  public selectedDocumentsSync!: any[];

  get schemaId(): string {
    return this.$route.params.id;
  }

  get schemaName(): string {
    return this.$store.getters[`${data.namespace}/getSchemaNameById`](this.schemaId);
  }

  get schema(): Schema {
    return this.$store.getters[`${data.namespace}/getSchemaWithFieldsById`](this.schemaId);
  }

  get availableViews(): string[] {
    const views = ['table-view'];

    if (this.schema && this.schema.settings.enableTreeView) {
      views.push('tree-view');
    }

    return views;
  }

  public handleSelectAll(): void {
    this.$emit('select-all');

    this.visibleSync = false;
  }
}
</script>

<style lang="scss">
.dockite-element--pagination {
  padding: 1rem;
}

.dockite-document-select--modal {
  width: 80%;
  max-height: 60vh;
  position: relative;

  display: flex;
  flex-direction: column;

  .el-dialog__body {
    overflow: hidden;
    overflow-y: auto;

    padding: 1rem;
    padding-top: 0;
  }
}
</style>
