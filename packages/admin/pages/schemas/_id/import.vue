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
import { Schema } from '@dockite/database';
import { omit } from 'lodash';
import { Component, Vue, Watch } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import JsonEditor from '~/components/base/json-editor.vue';
import * as data from '~/store/data';
import * as schema from '~/store/schema';

@Component({
  components: {
    Fragment,
    JsonEditor,
  },
})
export default class ImportSchemaWithIdPage extends Vue {
  public payload = '';

  get schemaName(): string {
    return this.$store.getters[`${data.namespace}/getSchemaNameById`](this.schemaId);
  }

  get schemaId(): string {
    return this.$route.params.id;
  }

  get schema(): Schema {
    return this.$store.getters[`${data.namespace}/getSchemaWithFieldsById`](this.$route.params.id);
  }

  public async handleImportSchema(): Promise<void> {
    try {
      await this.$store.dispatch(`${schema.namespace}/importSchema`, {
        schemaId: this.schemaId,
        payload: this.payload,
      });

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

  public fetchSchemaById(force = false): Promise<void> {
    return this.$store.dispatch(`${data.namespace}/fetchSchemaWithFieldsById`, {
      id: this.$route.params.id,
      force,
    });
  }

  @Watch('schemaId', { immediate: true })
  handleSchemaIdChange(): void {
    this.fetchSchemaById();
  }

  @Watch('schema', { immediate: true })
  handleSchemaChange(): void {
    console.log(this.schema);
    if (this.schema !== null) {
      this.payload = JSON.stringify(
        {
          ...omit(this.schema, 'type', 'createdAt', 'updatedAt', 'deletedAt', '__typename'),
          groups: Object.keys(this.schema.groups).map(key => ({ [key]: this.schema.groups[key] })),
          fields: this.schema.fields.map(field => omit(field, ['schemaId', '__typename'])),
        },
        null,
        2,
      );
    }
  }

  mounted(): void {
    this.fetchSchemaById().then(() => this.handleSchemaChange());
  }
}
</script>

<style lang="scss"></style>
