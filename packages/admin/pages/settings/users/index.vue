<template>
  <fragment>
    <portal to="header">
      <el-row type="flex" justify="space-between" align="middle">
        <h2>All Users</h2>
        <router-link to="/settings/users/create">
          <el-button>Create</el-button>
        </router-link>
      </el-row>
    </portal>

    <div class="all-users-page">
      <el-table :data="allUsers.results" style="width: 100%">
        <el-table-column prop="id" label="ID">
          <template slot-scope="scope">
            <router-link :to="`/settings/users/${scope.row.id}`">
              {{ scope.row.id | shortDesc }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="Name">
          <template slot-scope="scope">
            <router-link :to="`/settings/users/${scope.row.id}`">
              {{ scope.row.firstName }} {{ scope.row.lastName }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="Created" :formatter="cellValueFromNow" />
        <el-table-column prop="updatedAt" label="Updated" :formatter="cellValueFromNow" />
        <el-table-column label="Actions">
          <template slot-scope="scope">
            <router-link :to="`/settings/users/${scope.row.id}`" style="padding-right: 0.75rem;">
              <i class="el-icon-edit-outline" />
            </router-link>

            <el-popconfirm
              title="Are you sure you want to delete this user?"
              confirm-button-text="Yes"
              cancel-button-text="No"
              @onConfirm="handleRemoveUser(scope.row.id)"
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

import { AllUsersResultItem, ManyResultSet } from '~/common/types';
import * as data from '~/store/data';
import * as user from '~/store/user';

@Component({
  components: {
    Fragment,
  },
})
export default class AllUsersPage extends Vue {
  get allUsers(): ManyResultSet<AllUsersResultItem> {
    const state: data.DataState = this.$store.state[data.namespace];

    return state.allUsers;
  }

  get currentPage(): number {
    if (!this.allUsers.currentPage) {
      return 1;
    }

    return this.allUsers.currentPage;
  }

  get totalPages(): number {
    if (!this.allUsers.totalPages) {
      return 1;
    }

    return this.allUsers.totalPages;
  }

  public fetchAllUsers(): void {
    this.$store.dispatch(`${data.namespace}/fetchAllUsers`);
  }

  public cellValueFromNow(_row: never, _column: never, cellValue: string, _index: never): string {
    return formatDistanceToNow(new Date(cellValue)) + ' ago';
  }

  public async handleRemoveUser(id: string): Promise<void> {
    await this.$store.dispatch(`${user.namespace}/deleteUser`, { userId: id });
    this.fetchAllUsers();
  }

  mounted(): void {
    this.fetchAllUsers();
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
