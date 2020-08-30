<template>
  <el-row type="flex" justify="center" align="middle" class="dockite-login-wrapper">
    <logo class="dockite-forgotten-password--logo" />

    <el-card class="dockite-forgotten-password--container">
      <el-form
        v-if="token"
        ref="resetForgottenPasswordForm"
        :model="resetForgottenPasswordForm"
        :rules="resetForgottenPasswordFormRules"
        @submit.native.prevent="resetForgottenPassword"
      >
        <h2 class="mb-3">Forgotten Password Reset</h2>

        <el-alert v-if="error" class="mb-2" type="error" show-icon :closable="false">
          {{ error }}
        </el-alert>

        <el-form-item label="Token" prop="token">
          <el-input ref="token" v-model="resetForgottenPasswordForm.token" />
        </el-form-item>

        <el-form-item label="New Password" prop="password">
          <el-input
            ref="password"
            v-model="resetForgottenPasswordForm.password"
            type="password"
            show-password
          />
        </el-form-item>

        <el-form-item class="pt-3">
          <div class="flex justify-between w-full">
            <router-link to="/">
              Cancel
            </router-link>

            <el-button :disabled="loading > 0" native-type="submit" type="primary">
              Confirm
            </el-button>
          </div>
        </el-form-item>
      </el-form>

      <el-form
        v-else
        ref="issueForgottenPasswordForm"
        :model="issueForgottenPasswordForm"
        :rules="issueForgottenPasswordFormRules"
        @submit.native.prevent="issueForgottenPassword"
      >
        <h2 class="mb-3">Forgot Password</h2>

        <el-alert v-if="error" class="mb-2" type="error" show-icon :closable="false">
          {{ error }}
        </el-alert>

        <el-form-item :label="$t('login.labels.email')" prop="email">
          <el-input ref="email" v-model="issueForgottenPasswordForm.email" type="email" />
        </el-form-item>

        <el-form-item class="pt-3">
          <div class="flex justify-between w-full">
            <router-link to="/">
              Cancel
            </router-link>

            <el-button :disabled="loading > 0" native-type="submit" type="primary">
              Confirm
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </el-row>
</template>

<script lang="ts">
import { Form, Input } from 'element-ui';
import { Component, Vue, Ref } from 'nuxt-property-decorator';

import { PASSWORD_MIN_LEN } from '~/common/constants';
import Logo from '~/components/base/logo.vue';
import { namespace } from '~/store/auth';

interface NewInstallationQueryResponse {
  newInstallation: boolean;
}

@Component({
  layout: 'auth',
  components: {
    Logo,
  },
})
export default class LoginPage extends Vue {
  public loading = 0;

  public error = '';

  public newInstallation = false;

  public issueForgottenPasswordForm = {
    email: '',
  };

  public resetForgottenPasswordForm = {
    token: '',
    password: '',
  };

  @Ref()
  readonly password!: Input;

  @Ref()
  readonly email!: Input;

  get token(): string | null {
    if (this.$route.query.token) {
      return this.$route.query.token as string;
    }

    return null;
  }

  get issueForgottenPasswordFormRules(): Record<string, Record<string, any>[]> {
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
    };
  }

  get resetForgottenPasswordFormRules(): Record<string, Record<string, any>[]> {
    return {
      token: [
        {
          required: true,
          message: 'Token is required',
          trigger: 'blur',
        },
      ],
      password: [
        {
          required: true,
          message: 'Password is required',
          trigger: 'blur',
        },
        {
          min: PASSWORD_MIN_LEN,
          message: `Password must be at least ${PASSWORD_MIN_LEN} characters`,
          trigger: 'blur',
        },
      ],
    };
  }

  public async issueForgottenPassword(): Promise<void> {
    try {
      this.loading += 1;

      const valid = await (this.$refs.issueForgottenPasswordForm as Form)
        .validate()
        .catch(() => null);

      if (!valid) {
        return;
      }

      await this.$store.dispatch(
        `${namespace}/forgottenPassword`,
        this.issueForgottenPasswordForm.email,
      );

      this.$message({
        message:
          'Your password reset request has been recieved, you should receive an email shortly.',
        type: 'success',
      });

      this.$router.push('/');
    } catch (_) {
      this.error = 'An unknown error occured, please try again shortly.';
    } finally {
      this.$nextTick(() => {
        this.loading -= 1;
      });
    }
  }

  public async resetForgottenPassword(): Promise<void> {
    try {
      this.loading += 1;

      const valid = await (this.$refs.resetForgottenPasswordForm as Form)
        .validate()
        .catch(() => null);

      if (!valid) {
        return;
      }

      await this.$store.dispatch(
        `${namespace}/resetForgottenPassword`,
        this.resetForgottenPasswordForm,
      );

      this.$message({
        message: 'Your password has been successfully reset, you may now try logging in.',
        type: 'success',
      });

      this.$router.push('/');
    } catch (_) {
      this.error = 'An unknown error occured, please try again shortly.';
    } finally {
      this.$nextTick(() => {
        this.loading -= 1;
      });
    }
  }

  mounted(): void {
    if (this.token) {
      this.resetForgottenPasswordForm.token = this.token;
      this.password.focus();
    } else {
      this.email.focus();
    }
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

.dockite-forgotten-password--container {
  width: 100%;
  max-width: 480px;

  border-top: 4px solid #2b6cb0;
}

.dockite-forgotten-password--title {
  font-size: 2rem;
}

.dockite-forgotten-password--logo {
  max-height: 6rem;
  margin-bottom: 1.5rem;
}
</style>
