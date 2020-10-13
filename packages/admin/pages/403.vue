<template>
  <fragment>
    <portal to="header">
      <h2>Access Forbidden</h2>
    </portal>
    <div class="container w-full flex justify-center">
      <div class="w-2/3 mx-auto bg-white p-5 shadow rounded my-5">
        <h1 class="title text-2xl">
          Sorry, the page you were trying to access is forbidden.
        </h1>
        <span class="block mb-3">
          If you believe this is a mistake please contact the site administrator.
        </span>
        <router-link to="/">Go Home</router-link>
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
export default class IndexPage extends Vue {
  get user(): string {
    return this.$store.getters[`${auth.namespace}/fullName`];
  }
}
</script>

<style></style>
