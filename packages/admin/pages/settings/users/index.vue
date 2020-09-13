<template>
  <fragment>
    <portal to="header">
      <el-row type="flex" justify="space-between" align="middle">
        <h2>All Users</h2>
        <router-link v-if="$can('internal:user:create')" to="/settings/users/create">
          <el-button>Create</el-button>
        </router-link>
      </el-row>
    </portal>

    <div v-loading="loading > 0" class="all-users-page bg-white el-loading-parent__min-height">
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
            <router-link
              :to="`/settings/users/${scope.row.id}`"
              style="padding-right: 0.75rem;"
              title="Update User"
            >
              <i class="el-icon-edit-outline" />
            </router-link>

            <el-popconfirm
              title="Are you sure you want to delete this user?"
              confirm-button-text="Yes"
              cancel-button-text="No"
              @onConfirm="handleRemoveUser(scope.row.id)"
            >
              <el-button
                slot="reference"
                type="text"
                title="Delete User"
                style="padding-right: 0.75rem;"
              >
                <i class="el-icon-delete" />
              </el-button>
            </el-popconfirm>

            <el-button
              slot="reference"
              type="text"
              title="Reset Password"
              @click="handleResetUserPassword(scope.row.email)"
            >
              <i class="el-icon-unlock" />
            </el-button>
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

import { AllUsersResultItem, ManyResultSet } from '~/common/types';
import * as data from '~/store/data';
import * as user from '~/store/user';

@Component({
  components: {
    Fragment,
  },
})
export default class AllUsersPage extends Vue {
  public loading = 0;

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
    try {
      this.loading += 1;

      await this.$store.dispatch(`${user.namespace}/deleteUser`, { userId: id });
      this.fetchAllUsers();
    } catch (_) {
      this.$message({
        message: 'An error occurred whilst deleting the user, please try again later.',
        type: 'error',
      });
    } finally {
      this.$nextTick(() => {
        this.loading -= 1;
      });
    }
  }

  public async handleResetUserPassword(email: string): Promise<void> {
    try {
      this.loading += 1;

      await this.$store.dispatch(`${user.namespace}/resetUserPassword`, email);

      this.$message({
        message: `The password for ${email} has been successfully reset, they will receive an email with instructions.`,
        type: 'success',
      });
    } catch (_) {
      this.$message({
        message: "An error occurred whilst resetting the user's password, please try again later.",
        type: 'error',
      });
    } finally {
      this.$nextTick(() => {
        this.loading -= 1;
      });
    }
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
