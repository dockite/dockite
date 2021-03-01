import ElForm from 'element-plus/lib/el-form';
import { defineComponent, onMounted, reactive, ref } from 'vue';
import { usePromiseLazy } from 'vue-composable';

import { loginFormRules, registerFormRules } from './formRules';

import { getNewInstallation } from '~/common/api';
import { AuthenticationError } from '~/common/errors';
import { Logo } from '~/components/Common/Logo';
import { useAuth } from '~/hooks';

import './Login.scss';

export const LoginPage = defineComponent({
  name: 'LoginPageComponent',

  setup: () => {
    const { handleLogin, handleRegisterFirstUser, handleInitProvider, state } = useAuth();

    const form = ref<typeof ElForm | null>(null);

    const error = ref('');

    const isNewInstallation = usePromiseLazy(() => {
      return getNewInstallation();
    });

    onMounted(async () => {
      if (!state.authenticated) {
        if (state.type !== 'internal') {
          await handleInitProvider();
        } else {
          await isNewInstallation.exec();
        }
      }
    });

    const loginState = reactive({
      email: '',
      password: '',
    });

    const registerState = reactive({
      email: '',
      firstName: '',
      lastName: '',
      password: '',
    });

    const handleFormSubmission = usePromiseLazy(
      async (): Promise<void> => {
        error.value = '';

        if (form.value) {
          try {
            // Validate the form
            const valid = await form.value.validate().catch(() => false);

            // If it's not valid return early
            if (!valid) {
              return;
            }

            // Otherwise handle the auth flow
            if (isNewInstallation.result.value) {
              await handleRegisterFirstUser(registerState);
            } else {
              await handleLogin(loginState);
            }
          } catch (err) {
            if (err instanceof AuthenticationError) {
              error.value = err.message;
            } else {
              error.value = 'An unknown error occurred, please try again later.';
            }
          }
        }
      },
    );

    const getFormContent = (): JSX.Element => {
      if (isNewInstallation.result.value) {
        return (
          <>
            <p class="text-sm pt-3 pb-5">
              Welcome to Dockite, we're glad to have you. Let's start by getting the details for
              your first user.
            </p>

            <el-form
              ref={form}
              model={registerState}
              rules={registerFormRules}
              label-position="top"
              onSubmit={() => handleFormSubmission.exec()}
            >
              <el-form-item label="Email" prop="email">
                <el-input ref="email" v-model={registerState.email} type="email" />
              </el-form-item>

              <el-form-item label="First Name" prop="firstName">
                <el-input v-model={registerState.firstName} />
              </el-form-item>

              <el-form-item label="Last Name" prop="lastName">
                <el-input v-model={registerState.lastName} />
              </el-form-item>

              <el-form-item label="Password" prop="password">
                <el-input v-model={registerState.password} type="password" />
              </el-form-item>

              <el-form-item>
                <div class="flex items-center justify-between">
                  <span />

                  <el-button
                    loading={handleFormSubmission.loading.value}
                    nativeType="submit"
                    type="primary"
                  >
                    Start using Dockite
                  </el-button>
                </div>
              </el-form-item>
            </el-form>
          </>
        );
      }

      return (
        <el-form
          ref={form}
          label-position="top"
          model={loginState}
          rules={loginFormRules}
          onSubmit={() => handleFormSubmission.exec()}
        >
          <el-form-item label="Email" prop="email">
            <el-input v-model={loginState.email} placeholder="username@example.com" />
          </el-form-item>

          <el-form-item label="Password" prop="password">
            <el-input v-model={loginState.password} type="password" placeholder="Password" />
          </el-form-item>

          <el-form-item>
            <div class="flex justify-between items-center w-full pt-2">
              <router-link to="/forgotten-password">Forgotten Password?</router-link>

              <el-button
                loading={handleFormSubmission.loading.value}
                nativeType="submit"
                type="primary"
              >
                Login
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      );
    };

    return () => {
      return (
        <div class="dockite-login--page flex flex-col w-full h-screen justify-center items-center">
          <Logo />

          <el-card v-loading={!isNewInstallation.loading}>
            {error.value && (
              <div class="mb-3">
                <el-alert title={error.value} type="error" showIcon={true} closable={false} />
              </div>
            )}

            {getFormContent()}
          </el-card>
        </div>
      );
    };
  },
});

export default LoginPage;
