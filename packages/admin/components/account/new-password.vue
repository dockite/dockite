<template>
  <el-form-item :required="true" label="Update Password" :class="{ 'is-error': error !== '' }">
    <el-row type="flex" justify="space-between">
      <el-input v-model="password" type="password" placeholder="Password"></el-input>
      <el-button style="margin-left: 1rem;" @click="handleUpdatePassword">
        Update
      </el-button>
    </el-row>
    <div v-if="error !== ''" class="el-form-item__error">
      {{ error }}
    </div>
  </el-form-item>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import * as auth from '~/store/auth';
import * as user from '~/store/user';

@Component({
  components: {
    Fragment,
  },
})
export default class IndexPage extends Vue {
  public password = '';

  public error = '';

  get user(): string {
    return this.$store.getters[`${auth.namespace}/fullName`];
  }

  @Watch('password')
  handlePasswordChange(password: string): void {
    if (password.length === 0) {
      this.error = 'New Password is required';
      return;
    }

    if (password.length < 6) {
      this.error = 'New Password must contain atleast 6 characters';
      return;
    }

    this.error = '';
  }

  public async handleUpdatePassword(): Promise<void> {
    if (this.password.length)
      try {
        await this.$store.dispatch(`${user.namespace}/updateUserPassword`, this.password);

        this.$message({
          message: 'Your password was updated successfully!',
          type: 'success',
        });
      } catch (err) {
        this.$message({
          message: 'Failed to update password, please try again later.',
          type: 'error',
        });
      }
  }
}
</script>

<style></style>
