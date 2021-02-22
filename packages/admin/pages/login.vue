<template>
  <el-row type="flex" justify="center" align="middle" class="dockite-login-wrapper">
    <logo class="dockite-login-form--logo" />

    <el-card class="dockite-login-form--container">
      <first-user v-if="newInstallation" />
      <div v-else>
        <el-alert v-if="error" type="error" show-icon :closable="false">
          {{ error }}
        </el-alert>
        <el-form
          ref="form"
          v-loading="loading > 0"
          :model="loginForm"
          :rules="loginFormRules"
          label-position="top"
          @submit.native.prevent="login"
        >
          <el-form-item :label="$t('login.labels.email')" prop="email">
            <el-input ref="email" v-model="loginForm.email" type="email" />
          </el-form-item>
          <el-form-item :label="$t('login.labels.password')" prop="password">
            <el-input v-model="loginForm.password" type="password" />
          </el-form-item>
          <el-form-item>
            <div class="flex justify-between items-center">
              <router-link to="/forgotten-password">
                Forgotten password?
              </router-link>

              <el-button :disabled="loading > 0" native-type="submit" type="primary">
                {{ $t('login.labels.button') }}
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </el-row>
</template>

<script lang="ts">
import { Form, Input } from 'element-ui';
import { Component, Vue, Ref } from 'nuxt-property-decorator';

import { PASSWORD_MIN_LEN } from '~/common/constants';
import Logo from '~/components/base/logo.vue';
import FirstUser from '~/components/login/first-user.vue';
import NewInstallationQuery from '~/graphql/queries/new-installation.gql';
import { namespace } from '~/store/auth';

interface NewInstallationQueryResponse {
  newInstallation: boolean;
}

@Component({
  layout: 'auth',
  components: {
    Logo,
    FirstUser,
  },
})
export default class LoginPage extends Vue {
  public loading = 0;

  public error = '';

  public newInstallation = false;

  public loginForm = {
    email: '',
    password: '',
  };

  @Ref()
  readonly email!: Input;

  async fetch(): Promise<void> {
    this.loading += 1;

    const { data } = await this.$apolloClient.query<NewInstallationQueryResponse>({
      query: NewInstallationQuery,
    });

    this.loading -= 1;

    this.newInstallation = data.newInstallation;
  }

  get loginFormRules(): Record<string, Record<string, any>[]> {
    const $t = this.$t.bind(this);

    return {
      email: [
        {
          required: true,
          message: $t('validationMessages.required', [$t('login.labels.email')]),
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
          message: $t('validationMessages.required', [$t('login.labels.password')]),
          trigger: 'blur',
        },
        {
          min: PASSWORD_MIN_LEN,
          message: $t('validationMessages.min.chars', [
            $t('login.labels.password'),
            PASSWORD_MIN_LEN,
          ]),
          trigger: 'blur',
        },
      ],
    };
  }

  public async login(): Promise<void> {
    try {
      this.loading += 1;

      let redirectRoute: string | null = null;

      if (this.$route.query.redirectTo && typeof this.$route.query.redirectTo === 'string') {
        redirectRoute = encodeURIComponent(this.$route.query.redirectTo.toString());
      }

      const valid = await (this.$refs.form as Form).validate();

      if (!valid) {
        return;
      }

      await this.$store.dispatch(`${namespace}/login`, this.loginForm);

      if (redirectRoute) {
        this.$router.push(redirectRoute);
      }

      this.$router.back();
    } catch (_) {
      this.error = 'The username or password provided is incorrect.';
    } finally {
      this.$nextTick(() => {
        this.loading -= 1;
      });
    }
  }

  mounted(): void {
    this.email.focus();
  }
}
</script>

<style lang="scss">
.dockite-login-wrapper {
  background: #fbfbfb;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  padding: 1rem;
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
  max-width: 480px;
  margin-bottom: 1.5rem;
}
</style>
