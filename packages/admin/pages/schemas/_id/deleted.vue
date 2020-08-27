<template>
  <fragment>
    <portal to="header">
      <el-row style="width: 100%" type="flex" justify="space-between" align="middle">
        <h2>
          Deleted - <strong>{{ schemaName }}</strong>
        </h2>

        <el-row type="flex" align="middle">
          <portal-target name="header-extra" style="margin-right: 1rem;" />

          <router-link :to="`/schemas/${schemaId}`">
            <el-button size="medium">
              <i class="el-icon-back" />
              Go Back
            </el-button>
          </router-link>
        </el-row>
      </el-row>
    </portal>

    <div class="all-schema-documents-page el-loading-parent__min-height">
      <table-view :deleted="true" />
    </div>
  </fragment>
</template>

<script lang="ts">
import { Schema } from '@dockite/database';
import { startCase } from 'lodash';
import { Component, Vue } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import FilterInput from '~/components/base/filter-input.vue';
import TableView from '~/components/schemas/views/table-view.vue';
import * as data from '~/store/data';

@Component({
  components: {
    Fragment,
    FilterInput,
    TableView,
  },
})
export default class SchemaDocumentsPage extends Vue {
  public startCase = startCase;

  get schemaId(): string {
    return this.$route.params.id;
  }

  get schemaName(): string {
    return this.$store.getters[`${data.namespace}/getSchemaNameById`](this.schemaId);
  }

  get schema(): Schema {
    return this.$store.getters[`${data.namespace}/getSchemaWithFieldsById`](this.schemaId);
  }
}
</script>

<style lang="scss">
.dockite-element--pagination {
  padding: 1rem;
}
</style>
