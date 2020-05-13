<template>
  <el-row type="flex" justify="center" align="middle" class="dockite-login-wrapper">
    <logo class="dockite-login-form--logo" />
    <el-card class="dockite-login-form--container">
      <el-form :model="loginForm" :rules="loginFormRules" @submit.native.prevent="">
        <el-form-item label="Email" prop="email">
          <el-input v-model="loginForm.email" type="email" />
        </el-form-item>
        <el-form-item label="Password" prop="password">
          <el-input v-model="loginForm.password" type="password" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary">
            Sign in
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </el-row>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';

import Logo from '~/components/base/logo.vue';

@Component({
  layout: 'auth',
  components: {
    Logo,
  },
})
export default class LoginPage extends Vue {
  public loginForm = {
    email: '',
    password: '',
  };

  public loginFormRules = {
    email: [
      {
        required: true,
        message: 'Email is required',
        trigger: 'blur',
      },
    ],
    password: [
      {
        required: true,
        message: 'Password is required',
        trigger: 'blur',
      },
    ],
  };
}
</script>

<style lang="scss">
.dockite-login-wrapper {
  flex-direction: column;
  height: 100vh;
  width: 100%;
}

.dockite-login-form--container {
  width: 100%;
  max-width: 480px;

  border-top: 4px solid #2b6cb0;
}

.dockite-login-form--title {
  font-size: 2rem;
}

.dockite-login-form--logo {
  max-height: 6rem;
  margin-bottom: 1.5rem;
}
</style>
