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

import * as auth from '~/store/auth';
import Logo from '~/components/base/logo.vue';
import StepOne from '~/components/schemas/create/step-1.vue';
import StepTwo from '~/components/schemas/create/step-2.vue';
import StepThree from '~/components/schemas/create/step-3.vue';

@Component({
  components: {
    Fragment,
    Logo,
    StepOne,
    StepTwo,
    StepThree,
  },
})
export default class IndexPage extends Vue {
  get user(): string {
    return this.$store.getters[`${auth.namespace}/fullName`];
  }
}
</script>

<style></style>
