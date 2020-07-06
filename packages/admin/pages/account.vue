<template>
  <fragment>
    <portal to="header">
      <h2>Account - {{ fullName }}</h2>
    </portal>
    <div class="dockite-account-page">
      <el-form v-if="user" @submit.native.prevent>
        <el-form-item label="First Name">
          <el-input :disabled="true" :value="user.firstName"></el-input>
        </el-form-item>

        <el-form-item label="Last Name">
          <el-input :disabled="true" :value="user.lastName"></el-input>
        </el-form-item>

        <el-form-item label="Email">
          <el-input type="email" :disabled="true" :value="user.email"></el-input>
        </el-form-item>

        <el-form-item label="Password">
          <el-input type="password" :disabled="true" placeholder="password"></el-input>
        </el-form-item>

        <el-form-item label="Roles">
          <div style="display: inline-block; width: 100%;">
            <el-tag v-for="role in user.roles" :key="role.name" style="margin: 0 0.25rem;">
              {{ role.name }}
            </el-tag>
          </div>
        </el-form-item>

        <el-form-item label="Scopes">
          <div style="display: inline-block; width: 100%;">
            <el-tag v-for="scope in user.scopes" :key="scope" style="margin: 0 0.25rem;">
              {{ scope }}
            </el-tag>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </fragment>
</template>

<script lang="ts">
import { User } from '@dockite/database';
import { Component, Vue } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import Logo from '~/components/base/logo.vue';
import * as auth from '~/store/auth';

@Component({
  components: {
    Fragment,
    Logo,
  },
})
export default class IndexPage extends Vue {
  get fullName(): string {
    return this.$store.getters[`${auth.namespace}/fullName`];
  }

  get user(): User | null {
    const state: auth.AuthState = this.$store.state[auth.namespace];

    return state.user;
  }
}
</script>

<style>
.dockite-account-page {
  background: #ffffff;
  padding: 1rem;
}
</style>
