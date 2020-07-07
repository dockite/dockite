<template>
  <div>
    <h3>API Keys</h3>
    <el-table :data="apiKeys">
      <el-table-column prop="apiKey" label="Key"></el-table-column>
      <el-table-column label="Actions" width="100px">
        <template slot-scope="scope">
          <el-button size="mini" type="danger" @click="handleRemoveAPIKey(scope.row.apiKey)">
            Revoke
          </el-button>
        </template>
      </el-table-column>
      <el-row slot="append" type="flex" justify="center" style="margin: 0.5rem auto;">
        <el-button @click="handleCreateAPIKey">
          Create API Key
        </el-button>
      </el-row>
    </el-table>
  </div>
</template>

<script lang="ts">
import { User } from '@dockite/database';
import { Component, Vue } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import * as auth from '~/store/auth';
import * as user from '~/store/user';

interface APIKey {
  apiKey: string;
}

@Component({
  components: {
    Fragment,
  },
})
export default class IndexPage extends Vue {
  get user(): User | null {
    const state: auth.AuthState = this.$store.state[auth.namespace];

    return state.user;
  }

  get apiKeys(): APIKey[] {
    if (this.user && this.user.apiKeys) {
      return this.user.apiKeys.map(key => ({ apiKey: key }));
    }

    return [];
  }

  public async handleCreateAPIKey(): Promise<void> {
    try {
      await this.$store.dispatch(`${user.namespace}/createAPIKey`);

      this.$message({
        message: 'Your API key was created successfully!',
        type: 'success',
      });
    } catch (err) {
      this.$message({
        message: 'Failed to create API key, please try again later.',
        type: 'error',
      });
    }
  }

  public async handleRemoveAPIKey(key: string): Promise<void> {
    try {
      await this.$store.dispatch(`${user.namespace}/removeAPIKey`, key);

      this.$message({
        message: 'Your API key was revoked!',
        type: 'success',
      });
    } catch (err) {
      this.$message({
        message: 'Failed to revoke API key, please try again later.',
        type: 'error',
      });
    }
  }
}
</script>

<style></style>
