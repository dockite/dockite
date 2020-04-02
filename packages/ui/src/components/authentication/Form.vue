<template>
  <fragment>
    <a-card v-show="view === viewTypes.Login" style="width: 450px">
      <h1>Dockite - Sign in</h1>
      <a-form-model :model="loginForm" :rules="loginRules" @submit="handleLogin" ref="loginForm">
        <a-form-model-item prop="email">
          <a-input v-model="loginForm.email" placeholder="john@example.com">
            <a-icon slot="prefix" type="user" style="color:rgba(0,0,0,.25)" />
          </a-input>
        </a-form-model-item>
        <a-form-model-item prop="password">
          <a-input placeholder="Password" v-model="loginForm.password">
            <a-icon slot="prefix" type="lock" style="color:rgba(0,0,0,.25)" />
          </a-input>
        </a-form-model-item>
        <a-form-model-item>
          <a-button type="primary" htmlType="submit" block>
            Sign in
          </a-button>
        </a-form-model-item>
        <a-form-model-item>
          <a-button type="link" @click="view = viewTypes.Register" block>
            Dont have an account? Register
          </a-button>
        </a-form-model-item>
      </a-form-model>
    </a-card>
    <a-card v-show="view === viewTypes.Register" style="width: 600px">
      <h1>Dockite - Register</h1>
      <a-form-model :model="loginForm" :rules="loginRules" @submit="handleLogin">
        <a-form-model-item prop="email">
          <a-input v-model="loginForm.email" placeholder="john@example.com">
            <a-icon slot="prefix" type="user" style="color:rgba(0,0,0,.25)" />
          </a-input>
        </a-form-model-item>
        <a-form-model-item prop="password">
          <a-input v-model="loginForm.password">
            <a-icon slot="prefix" type="lock" style="color:rgba(0,0,0,.25)" />
          </a-input>
        </a-form-model-item>
      </a-form-model>
    </a-card>
  </fragment>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { gql } from 'apollo-boost';

enum ViewTypes {
  Login = 'login',
  Register = 'register',
}

@Component
export class AuthenticationForm extends Vue {
  public viewTypes = ViewTypes;

  public view = this.viewTypes.Login;

  public loginForm: { email: string; password: string } = {
    email: '',
    password: '',
  };

  public loginRules: Record<string, any> = {
    email: [
      {
        required: true,
        message: 'Email is required',
        trigger: 'change',
      },
    ],
    password: [
      {
        required: true,
        message: 'Password is required',
        trigger: 'change',
      },
    ],
  };

  public async handleLogin() {
    try {
      await new Promise((resolve, reject) => {
        (this.$refs.loginForm as any).validate((valid: boolean) => (valid ? resolve() : reject()));
      });

      const { data } = await this.$apollo.mutate({
        mutation: gql`
          mutation LoginUser($email: String!, $password: String!) {
            login(email: $email, password: $password) {
              token
            }
          }
        `,
        variables: { ...this.loginForm },
      });

      const { token } = data.login;

      window.localStorage.setItem('auth_token', token);
    } catch (err) {
      this.$message.error('Error signing into account');
    }
  }
}

export default AuthenticationForm;
</script>

<style lang="scss">
.ant-form-item {
  margin-bottom: 0 !important;
}
</style>
