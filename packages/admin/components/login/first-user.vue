<template>
  <div>
    <p class="dockite-text--subtitle">
      Welcome to Dockite, we're glad to have you, lets start by getting the details of the first
      user for the system.
    </p>
    <el-form
      ref="form"
      :model="registerForm"
      :rules="registerFormRules"
      label-position="top"
      @submit.native.prevent="register"
    >
      <el-form-item label="Email" prop="email">
        <el-input ref="email" v-model="registerForm.email" type="email" />
      </el-form-item>

      <el-form-item label="First Name" prop="firstName">
        <el-input v-model="registerForm.firstName" />
      </el-form-item>

      <el-form-item label="Last Name" prop="lastName">
        <el-input v-model="registerForm.lastName" />
      </el-form-item>

      <el-form-item label="Password" prop="password">
        <el-input v-model="registerForm.password" type="password" />
      </el-form-item>

      <el-form-item>
        <el-button native-type="submit" type="primary">
          Start using Dockite
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { Form, Input } from 'element-ui';
import { Component, Vue, Ref } from 'nuxt-property-decorator';

import { PASSWORD_MIN_LEN } from '~/common/constants';
import Logo from '~/components/base/logo.vue';
import { namespace } from '~/store/auth';

@Component({
  layout: 'auth',
  components: {
    Logo,
  },
})
export default class RegisterFirstUserComponent extends Vue {
  @Ref()
  readonly email!: Input;

  public registerForm = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  };

  get registerFormRules(): Record<string, Record<string, any>[]> {
    const $t = this.$t.bind(this);

    return {
      email: [
        {
          required: true,
          message: $t('validationMessages.required', ['Email']),
          trigger: 'blur',
        },
        {
          type: 'email',
          message: $t('validationMessages.invalid.email'),
          trigger: 'blur',
        },
      ],
      password: [
        {
          required: true,
          message: $t('validationMessages.required', ['Password']),
          trigger: 'blur',
        },
        {
          min: PASSWORD_MIN_LEN,
          message: $t('validationMessages.min.chars', [
            $t('register.labels.password'),
            PASSWORD_MIN_LEN,
          ]),
          trigger: 'blur',
        },
      ],
      firstName: [
        {
          required: true,
          message: $t('validationMessages.required', ['First Name']),
          trigger: 'blur',
        },
      ],
      lastName: [
        {
          required: true,
          message: $t('validationMessages.required', ['Last Name']),
          trigger: 'blur',
        },
      ],
    };
  }

  public async register(): Promise<void> {
    try {
      const valid = await (this.$refs.form as Form).validate();

      if (!valid) {
        return;
      }

      await this.$store.dispatch(`${namespace}/registerFirstUser`, this.registerForm);

      this.$router.push('/');
    } catch (err) {
      console.log(err);

      this.$message({
        message: 'Something went wrong and we were unable to register your user.',
        type: 'error',
      });
    }
  }

  mounted(): void {
    this.email.focus();
  }
}
</script>

<style lang="scss">
.dockite-register-wrapper {
  background: #fbfbfb;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  padding: 1rem;
}

.dockite-register-form--container {
  width: 100%;
  max-width: 480px;

  border-top: 4px solid #2b6cb0;
}

.dockite-register-form--title {
  font-size: 2rem;
}

.dockite-register-form--logo {
  max-height: 6rem;
  margin-bottom: 1.5rem;
}
</style>
