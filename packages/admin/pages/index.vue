<template>
  <fragment>
    <portal to="header">
      <h2>Welcome back, {{ user }}</h2>
    </portal>
    <div class="container">
      <div>
        <logo class="m-auto w-2/3" />
        <h1 class="title"></h1>
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
