<template>
  <el-dialog
    custom-class="dockite-document-select--modal"
    title="Select Documents"
    :visible.sync="visibleSync"
  >
    <div class="flex flex-row justify-between items-center pb-3">
      <el-button size="medium" @click="handleSelectAll">
        Select All
      </el-button>
      <portal-target name="header-extra" />
    </div>
    <table-view :selected-items.sync="selectedDocumentsSync" :selectable="true"></table-view>

    <template slot="footer">
      <el-button type="primary" @click="visibleSync = false">
        Confirm
      </el-button>
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
  height: auto;
  max-height: 60vh;

  .el-dialog__body {
    padding: 1rem;
  }
}
</style>
