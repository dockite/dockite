<template>
  <el-row type="flex" justify="center" align="middle" class="dockite-login-wrapper">
    <logo class="dockite-login-form--logo" />

    <el-card class="dockite-login-form--container">
      <p>You have been successfully logged out, you will be redirected shortly.</p>
    </el-card>
  </el-row>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';

import Logo from '~/components/base/logo.vue';
import { namespace } from '~/store/auth';

@Component({
  layout: 'default',

  components: {
    Logo,
  },
})
export default class LogoutPage extends Vue {
  public async logout(): Promise<void> {
    await this.$store.dispatch(`${namespace}/logout`);

    this.$router.push('/login');
  }

  mounted(): void {
    this.logout();
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
  margin-bottom: 1.5rem;
}
</style>
