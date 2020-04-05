<template>
  <div class="home">
    <portal to="title">
      <a-row v-if="!$apollo.loading" type="flex" align="middle" class="title-row">
        <h1>Welcome back, {{ user.firstName }} {{ user.lastName }}</h1>
      </a-row>
    </portal>
    hullo
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

import { AccountState } from '../store/account/types';

@Component
export class HomePage extends Vue {
  get user() {
    return (this.$store.state.account as AccountState).user;
  }
}

export default HomePage;
</script>
