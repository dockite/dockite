import { defineComponent, onMounted, reactive } from 'vue';

import { Logo } from '~/components/Common/Logo';
import { useAuth } from '~/hooks';
import './Login.scss';

type LoginPageProps = never;

export const LoginPage = defineComponent<LoginPageProps>(() => {
  const { handleLogin, handleInitProvider, state } = useAuth();

  onMounted(async () => {
    if (!state.authenticated && state.type !== 'internal') {
      await handleInitProvider();
    }
  });

  const loginState = reactive({
    email: '',
    password: '',
  });

  return () => (
    <div class="dockite-login--page flex flex-col w-full h-screen justify-center items-center">
      <Logo />

      <el-card>
        <el-form label-position="top">
          <el-form-item label="Email">
            <el-input v-model={loginState.email} placeholder="username@example.com" />
          </el-form-item>

          <el-form-item label="Password">
            <el-input v-model={loginState.password} type="password" placeholder="Password" />
          </el-form-item>

          <el-form-item>
            <div class="flex justify-between items-center w-full pt-2">
              <router-link to="/forgotten-password">Forgotten Password?</router-link>

              <el-button type="primary" onClick={() => handleLogin(loginState)}>
                Login
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  );
});

export default LoginPage;
