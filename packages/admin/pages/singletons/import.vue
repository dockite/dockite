<template>
  <fragment>
    <portal to="header">
      <h2>Import Singleton</h2>
    </portal>

    <div v-loading="loading > 0" class="import-singleton-page el-loading-parent__min-height">
      <json-editor v-model="payload" style="height: 60vh;" />

      <div style="padding-top: 1rem;" />

      <el-row type="flex" justify="space-between" align="middle">
        <el-button type="text" @click="$router.go(-1)">Cancel</el-button>
        <el-button type="primary" :disabled="loading > 0" @click.prevent="handleImportSingleton">
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
export default class ImportSingletonPage extends Vue {
  public payload = '';

  public loading = 0;

  public async handleImportSingleton(): Promise<void> {
    try {
      this.loading += 1;

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
    } finally {
      this.$nextTick(() => {
        this.loading -= 1;
      });
    }
  }
}
</script>

<style lang="scss"></style>
