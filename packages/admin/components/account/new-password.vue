<template>
  <el-form-item :rules="rules" label="Update Password">
    <el-row type="flex" justify="space-between">
      <el-input v-model="password" type="password" placeholder="Password"></el-input>
      <el-button style="margin-left: 1rem;" @click="handleUpdatePassword">
        Update
      </el-button>
    </el-row>
  </el-form-item>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';
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

  get user(): string {
    return this.$store.getters[`${auth.namespace}/fullName`];
  }

  get rules(): object[] {
    return [
      {
        required: true,
        trigger: 'blur',
        message: 'New Password is required',
      },
      {
        min: 6,
        trigger: 'blur',
        message: 'New Password must contain atleast 6 characters',
      },
    ];
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
