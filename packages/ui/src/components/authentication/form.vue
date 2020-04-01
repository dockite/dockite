<template>
  <fragment>
    <a-card v-show="view === viewTypes.Login" style="width: 450px">
      <h1>Dockite - Login</h1>
      <a-form-model :model="loginForm" :rules="loginRules">
        <a-form-model-item label="Email" prop="email">
          <a-input v-model="loginForm.email" placeholder="john@example.com" />
        </a-form-model-item>
        <a-form-model-item label="Password" prop="password">
          <a-input v-model="loginForm.password" />
        </a-form-model-item>
        <a-form-model-item style="margin-top: 1rem;">
          <a-button type="primary" size="large" html-type="submit">
            Login
          </a-button>
        </a-form-model-item>
      </a-form-model>
    </a-card>
    <a-card v-show="view === viewTypes.Register" style="width: 600px">
      <h1>Dockite - Register</h1>
      <a-form-model :model="loginForm" :rules="loginRules">
        <a-form-model-item label="Email" prop="email">
          <a-input v-model="loginForm.email" placeholder="john@example.com" />
        </a-form-model-item>
        <a-form-model-item label="Password" prop="password">
          <a-input v-model="loginForm.password" />
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
    } catch (err) {
      this.$message.error('Error creating account');
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
