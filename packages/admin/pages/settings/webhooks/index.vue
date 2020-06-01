<template>
  <fragment>
    <portal to="header">
      <el-row type="flex" justify="space-between" align="middle">
        <h2>All Webhooks</h2>
        <router-link to="/settings/webhooks/create">
          <el-button>Create</el-button>
        </router-link>
      </el-row>
    </portal>

    <div class="all-documents-page">
      <el-table :data="allWebhooks.results" style="width: 100%">
        <el-table-column prop="id" label="ID">
          <template slot-scope="scope">
            <router-link :to="`/settings/webhooks/${scope.row.id}`">
              {{ scope.row.id.slice(0, 8) + '...' }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="Name">
          <template slot-scope="scope">
            <router-link :to="`/settings/webhooks/${scope.row.id}`">
              {{ scope.row.name }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column prop="method" label="HTTP Method"></el-table-column>
        <el-table-column prop="createdAt" label="Created" :formatter="cellValueFromNow" />
        <el-table-column prop="updatedAt" label="Updated" :formatter="cellValueFromNow" />
        <el-table-column label="Actions">
          <template slot-scope="scope">
            <router-link
              :to="`/settings/webhooks/${scope.row.id}/edit`"
              style="padding-right: 0.75rem;"
            >
              <i class="el-icon-edit-outline" />
            </router-link>
            <router-link :to="`/settings/webhooks/${scope.row.id}/delete`">
              <i class="el-icon-delete" />
            </router-link>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="dockite-element--pagination"
        :current-page="currentPage"
        :page-count="totalPages"
        :pager-count="5"
        hide-on-single-page
        layout="prev, pager, next"
      />
    </div>
  </fragment>
</template>

<script lang="ts">
import { formatDistanceToNow } from 'date-fns';
import { Component, Vue } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import { AllWebhooksResultItem, ManyResultSet } from '~/common/types';
import * as data from '~/store/data';

@Component({
  components: {
    Fragment,
  },
})
export default class AllWebhooksPage extends Vue {
  get allWebhooks(): ManyResultSet<AllWebhooksResultItem> {
    const state: data.DataState = this.$store.state[data.namespace];

    return state.allWebhooks;
  }

  get currentPage(): number {
    if (!this.allWebhooks.currentPage) {
      return 1;
    }

    return this.allWebhooks.currentPage;
  }

  get totalPages(): number {
    if (!this.allWebhooks.totalPages) {
      return 1;
    }

    return this.allWebhooks.totalPages;
  }

  public fetchAllWebhooks(): void {
    this.$store.dispatch(`${data.namespace}/fetchAllWebhooks`);
  }

  public cellValueFromNow(_row: never, _column: never, cellValue: string, _index: never): string {
    return formatDistanceToNow(new Date(cellValue)) + ' ago';
  }

  mounted(): void {
    this.fetchAllWebhooks();
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
</style>
