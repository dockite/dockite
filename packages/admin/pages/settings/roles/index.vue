<template>
  <fragment>
    <portal to="header">
      <el-row type="flex" justify="space-between" align="middle">
        <h2>All Roles</h2>
        <router-link v-if="$can('internal:roles:create')" to="/settings/roles/create">
          <el-button>Create</el-button>
        </router-link>
      </el-row>
    </portal>

    <div v-loading="loading > 0" class="all-roles-page el-loading-parent__min-height">
      <el-table :data="allRoles.results" style="width: 100%">
        <el-table-column prop="name" label="Name">
          <template slot-scope="scope">
            <router-link :to="`/settings/roles/${scope.row.name}`">
              {{ scope.row.name }}
            </router-link>
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="Created" :formatter="cellValueFromNow" />

        <el-table-column prop="updatedAt" label="Updated" :formatter="cellValueFromNow" />

        <el-table-column label="Actions">
          <template slot-scope="scope">
            <router-link :to="`/settings/roles/${scope.row.name}`" style="padding-right: 0.75rem;">
              <i class="el-icon-edit-outline" />
            </router-link>

            <el-popconfirm
              title="Are you sure you want to delete this role?"
              confirm-button-text="Yes"
              cancel-button-text="No"
              @onConfirm="handleRemoveRole(scope.row.name)"
            >
              <el-button slot="reference" type="text">
                <i class="el-icon-delete" />
              </el-button>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="dockite-element--pagination"
        :current-page="currentPage"
        :page-count="totalPages"
        :pager-count="5"
        layout="prev, pager, next"
      />
    </div>
  </fragment>
</template>

<script lang="ts">
import { formatDistanceToNow } from 'date-fns';
import { Component, Vue } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import { AllRolesResultItem, ManyResultSet } from '~/common/types';
import * as data from '~/store/data';
import * as role from '~/store/role';

@Component({
  components: {
    Fragment,
  },
})
export default class AllRolesPage extends Vue {
  public loading = 0;

  get allRoles(): ManyResultSet<AllRolesResultItem> {
    const state: data.DataState = this.$store.state[data.namespace];

    return state.allRoles;
  }

  get currentPage(): number {
    if (!this.allRoles.currentPage) {
      return 1;
    }

    return this.allRoles.currentPage;
  }

  get totalPages(): number {
    if (!this.allRoles.totalPages) {
      return 1;
    }

    return this.allRoles.totalPages;
  }

  public async fetchAllRoles(): Promise<void> {
    try {
      this.loading += 1;

      await this.$store.dispatch(`${data.namespace}/fetchAllRoles`, { perPage: 10000 });
    } catch (_) {
      this.$message({
        message: 'An error occurred whilst fetching roles, please try again later.',
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

  public async handleRemoveRole(name: string): Promise<void> {
    try {
      this.loading += 1;

      await this.$store.dispatch(`${role.namespace}/deleteRole`, { roleName: name });
      this.fetchAllRoles();
    } catch (_) {
      this.$message({
        message: 'An error occurred whilst deleting the role, please try again later.',
        type: 'error',
      });
    } finally {
      this.$nextTick(() => {
        this.loading -= 1;
      });
    }
  }

  mounted(): void {
    this.fetchAllRoles();
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
