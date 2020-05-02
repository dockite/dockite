<template>
  <fragment>
    <a-card v-show="view === viewTypes.Login" class="authentication-card authentication-card-login">
      <h1>Dockite - Sign in</h1>
      <a-form-model
        ref="loginForm"
        :model="loginForm"
        :rules="loginRules"
        @submit="handleLogin"
        @submit.native.prevent
      >
        <a-form-model-item prop="email">
          <a-input v-model="loginForm.email" placeholder="john@example.com">
            <a-icon slot="prefix" type="user" style="color:rgba(0,0,0,.25)" />
          </a-input>
        </a-form-model-item>
        <a-form-model-item prop="password">
          <a-input v-model="loginForm.password" type="password" placeholder="Password">
            <a-icon slot="prefix" type="lock" style="color:rgba(0,0,0,.25)" />
          </a-input>
        </a-form-model-item>
        <a-form-model-item class="ant-form-item-no-margin">
          <a-button type="primary" html-type="submit" block>
            Sign in
          </a-button>
        </a-form-model-item>
        <a-form-model-item>
          <a-button type="link" block @click="view = viewTypes.Register">
            Dont have an account? Register
          </a-button>
        </a-form-model-item>
      </a-form-model>
    </a-card>

    <a-card
      v-show="view === viewTypes.Register"
      class="authentication-card authentication-card-register"
    >
      <h1>Dockite - Register</h1>
      <a-form-model
        ref="registerForm"
        :model="registerForm"
        :rules="registerRules"
        @submit="handleRegister"
        @submit.native.prevent
      >
        <a-form-model-item label="Email" prop="email">
          <a-input v-model="registerForm.email" placeholder="john@example.com">
            <!-- <a-icon slot="prefix" type="user" style="color:rgba(0,0,0,.25)" /> -->
          </a-input>
        </a-form-model-item>
        <a-form-model-item label="Fistname" prop="firstName">
          <a-input v-model="registerForm.firstName" placeholder="John">
            <!-- <a-icon slot="prefix" type="user" style="color:rgba(0,0,0,.25)" /> -->
          </a-input>
        </a-form-model-item>
        <a-form-model-item label="Lastname" prop="lastName">
          <a-input v-model="registerForm.lastName" placeholder="Doe">
            <!-- <a-icon slot="prefix" type="user" style="color:rgba(0,0,0,.25)" /> -->
          </a-input>
        </a-form-model-item>
        <a-form-model-item style="margin-bottom: 0.5rem;" label="Password" prop="password">
          <a-input v-model="registerForm.password" placeholder="Password">
            <!-- <a-icon slot="prefix" type="lock" style="color:rgba(0,0,0,.25)" /> -->
          </a-input>
        </a-form-model-item>
        <a-form-model-item>
          <a-button type="primary" html-type="submit" block>
            Register
          </a-button>
        </a-form-model-item>
        <a-form-model-item>
          <a-button type="link" block @click="view = viewTypes.Login">
            Cancel
          </a-button>
        </a-form-model-item>
      </a-form-model>
    </a-card>
  </fragment>
</template>

<script lang="ts">
import { gql } from 'apollo-boost';
import { Component, Vue } from 'vue-property-decorator';

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
      {
        type: 'email',
        message: 'Email must be a valid email',
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
        // eslint-disable-next-line
        (this.$refs.loginForm as any).validate((valid: boolean) => (valid ? resolve() : reject()));
      });

      await this.$store.dispatch('account/login', this.loginForm);
    } catch (err) {
      this.$message.error('Error signing into account');
    }
  }

  public registerForm: { email: string; firstName: string; lastName: string; password: string } = {
    email: '',
    firstName: '',
    lastName: '',
    password: '',
  };

  public registerRules: Record<string, any> = {
    email: [
      {
        required: true,
        message: 'Email is required',
        trigger: 'change',
      },
      {
        type: 'email',
        message: 'Email must be a valid email',
        trigger: 'change',
      },
    ],
    firstName: [
      {
        required: true,
        message: 'Firstname is required',
        trigger: 'change',
      },
    ],
    lastName: [
      {
        required: true,
        message: 'Lastname is required',
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

  public async handleRegister() {
    try {
      await new Promise((resolve, reject) => {
        // eslint-disable-next-line
        (this.$refs.registerForm as any).validate((valid: boolean) => (valid ? resolve() : reject()));
      });

      await this.$store.dispatch('account/register', this.registerForm);
    } catch (err) {
      this.$message.error('Error signing into account');
    }
  }
}

export default AuthenticationForm;
</script>

<style lang="scss">
.authentication-card {
  width: 450px;
  transition: 300ms;

  .ant-form-item.ant-form-item-no-margin {
    margin-bottom: 0 !important;
  }

  &.authentication-card-login {
    .ant-form-item {
      margin-bottom: 0.5rem;
    }
  }

  &.authentication-card-register {
    .ant-form-item {
      margin-bottom: 0rem;
    }
  }
}
</style>
