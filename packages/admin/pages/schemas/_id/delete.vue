<template>
  <fragment>
    <portal to="header">
      <h2>
        Delete
        <strong>
          {{ schemaName }}
        </strong>
      </h2>
    </portal>

    <div class="delete-document-page">
      <el-card>
        <template slot="header">
          <h3>Are you sure you want to delete {{ schemaName }}?</h3>
        </template>
        <div class="dockite-document--detail">
          <p class="dockite-text--subtitle">
            You won't be able to recover this Schema later on and all corresponding documents will
            be deleted too.
          </p>
        </div>
        <el-row type="flex" justify="space-between">
          <el-button @click.prevent="$router.go(-1)">
            Cancel
          </el-button>
          <el-button type="danger">
            Delete
          </el-button>
        </el-row>
      </el-card>
    </div>
  </fragment>
</template>

<script lang="ts">
// import { Document } from '@dockite/types';
import { Component, Vue, Watch } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import * as data from '~/store/data';

@Component({
  components: {
    Fragment,
  },
})
export default class AllDocumentsPage extends Vue {
  get schemaName(): string {
    return this.$store.getters[`${data.namespace}/getSchemaNameById`](this.schemaId);
  }

  get schemaId(): string {
    return this.$route.params.id;
  }

  public fetchSchemaById(): void {
    this.$store.dispatch(`${data.namespace}/fetchSchemaWithFieldsById`, { id: this.schemaId });
  }

  @Watch('schemaId', { immediate: true })
  handleSchemaIdChange(): void {
    this.fetchSchemaById();
  }
}
</script>

<style lang="scss">
.dockite-element--pagination {
  /* background: #ffffff; */
  background: transparent;

  li {
    background: transparent;
  }

  button {
    background: transparent;
  }
}

.dockite-document--detail {
  padding-bottom: 1.5rem;
}

.dockite-text--subtitle {
  border-left: 4px solid #eeeeee;
  padding-left: 0.5rem;
  color: rgba(0, 0, 0, 0.66);
  font-style: italic;
}
</style>
