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
        <el-button
          v-if="$can('internal:schema:update')"
          type="primary"
          :disabled="loading > 0"
          @click.prevent="handleImportSingleton"
        >
          Import Singleton
        </el-button>
      </el-row>
    </div>
  </fragment>
</template>

<script lang="ts">
import { Singleton } from '@dockite/database';
import { omit } from 'lodash';
import { Component, Vue, Watch } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import JsonEditor from '~/components/base/json-editor.vue';
import * as data from '~/store/data';
import * as singleton from '~/store/singleton';

@Component({
  components: {
    Fragment,
    JsonEditor,
  },
})
export default class ImportSingletonWithIdPage extends Vue {
  public payload = '';

  public loading = 0;

  get singletonName(): string {
    return this.$store.getters[`${data.namespace}/getSingletonNameById`](this.singletonId);
  }

  get singletonId(): string {
    return this.$route.params.id;
  }

  get singleton(): Singleton {
    return this.$store.getters[`${data.namespace}/getSingletonWithFieldsById`](
      this.$route.params.id,
    );
  }

  public async handleImportSingleton(): Promise<void> {
    try {
      this.loading += 1;

      await this.$store.dispatch(`${singleton.namespace}/importSingleton`, {
        singletonId: this.singletonId,
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
      this.loading -= 1;
    }
  }

  public async fetchSingletonById(force = false): Promise<void> {
    this.loading += 1;

    await this.$store.dispatch(`${data.namespace}/fetchSingletonWithFieldsById`, {
      id: this.$route.params.id,
      force,
    });

    this.loading -= 1;
  }

  @Watch('singletonId', { immediate: true })
  handleSingletonIdChange(): void {
    this.fetchSingletonById();
  }

  @Watch('singleton', { immediate: true })
  handleSingletonChange(): void {
    if (this.singleton) {
      this.payload = JSON.stringify(
        {
          ...omit(this.singleton, 'type', 'createdAt', 'updatedAt', 'deletedAt', '__typename'),
          groups: Object.keys(this.singleton.groups).map(key => ({
            [key]: this.singleton.groups[key],
          })),
          fields: this.singleton.fields.map(field => omit(field, 'schemaId', '__typename')),
        },
        null,
        2,
      );
    }
  }
}
</script>

<style lang="scss"></style>
