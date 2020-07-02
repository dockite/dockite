<template>
  <fragment>
    <portal to="header">
      <h2>Import Schema</h2>
    </portal>

    <div class="import-schema-page">
      <json-editor v-model="payload" style="height: 60vh;" />
      <div style="padding-top: 1rem;" />
      <el-row type="flex" justify="space-between" align="middle">
        <el-button type="text" @click="$router.go(-1)">Cancel</el-button>
        <el-button type="primary" @click.prevent="handleImportSchema">
          Import Schema
        </el-button>
      </el-row>
    </div>
  </fragment>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import JsonEditor from '~/components/base/json-editor.vue';
import * as schema from '~/store/schema';

@Component({
  components: {
    Fragment,
    JsonEditor,
  },
})
export default class AllSchemasPage extends Vue {
  public payload = '';

  public async handleImportSchema(): Promise<void> {
    try {
      await this.$store.dispatch(`${schema.namespace}/importSchema`, { payload: this.payload });

      this.$message({
        message: 'Schema imported successfully!',
        type: 'success',
      });

      this.$router.replace('/schemas');
    } catch (err) {
      console.log(err);

      this.$message({
        message: 'Unable to import schema, please check for any errors.',
        type: 'error',
      });
    }
  }
}
</script>

<style lang="scss"></style>
