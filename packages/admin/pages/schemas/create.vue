<template>
  <fragment>
    <portal to="header">
      <h2>Create a new Schema</h2>
    </portal>

    <div class="create-schema-page">
      <el-steps :active="1" simple class="dockite-steps--create-schema">
        <el-step title="Name" />
        <el-step title="Fields" />
        <el-step title="Create" />
      </el-steps>
    </div>
  </fragment>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import * as auth from '~/store/auth';
import Logo from '~/components/base/logo.vue';

@Component({
  components: {
    Fragment,
    Logo,
  },
})
export default class CreateSchemaPage extends Vue {
  get user(): string {
    return this.$store.getters[`${auth.namespace}/fullName`];
  }
}
</script>

<style>
.create-schema-page {
  background: #ffffff;
}

.dockite-steps--create-schema {
  background: #ffffff;
}
</style>
