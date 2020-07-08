<template>
  <fragment>
    <portal to="header">
      <h2>Import Singleton</h2>
    </portal>

    <div class="import-singleton-page">
      <json-editor v-model="payload" style="height: 60vh;" />
      <div style="padding-top: 1rem;" />
      <el-row type="flex" justify="space-between" align="middle">
        <el-button type="text" @click="$router.go(-1)">Cancel</el-button>
        <el-button type="primary" @click.prevent="handleImportSingleton">
          Import Singleton
        </el-button>
      </el-row>
    </div>
  </fragment>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import JsonEditor from '~/components/base/json-editor.vue';
import * as singleton from '~/store/singleton';

@Component({
  components: {
    Fragment,
    JsonEditor,
  },
})
export default class AllSingletonsPage extends Vue {
  public payload = '';

  public async handleImportSingleton(): Promise<void> {
    try {
      await this.$store.dispatch(`${singleton.namespace}/importSingleton`, {
        payload: this.payload,
      });

      this.$message({
        message: 'Singleton imported successfully!',
        type: 'success',
      });

      this.$router.replace('/singletons');
    } catch (err) {
      console.log(err);

      this.$message({
        message: 'Unable to import singleton, please check for any errors.',
        type: 'error',
      });
    }
  }
}
</script>

<style lang="scss"></style>
