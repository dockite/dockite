<template>
  <fragment>
    <portal to="header">
      <h2>Welcome back, {{ user }}</h2>
    </portal>
    <div class="container">
      <div>
        <logo />
        <h1 class="title">
          admin
        </h1>
        <h2 class="subtitle">
          My superb Nuxt.js project
        </h2>
        <div class="links">
          <a href="https://nuxtjs.org/" target="_blank" class="button--green">
            Documentation
          </a>
          <a href="https://github.com/nuxt/nuxt.js" target="_blank" class="button--grey">
            GitHub
          </a>
        </div>
      </div>
    </div>
  </fragment>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import Logo from '~/components/base/logo.vue';
import * as auth from '~/store/auth';

@Component({
  components: {
    Fragment,
    Logo,
  },
})
export default class WebhookSettingsPage extends Vue {
  get user(): string {
    return this.$store.getters[`${auth.namespace}/fullName`];
  }
}
</script>

<style></style>
