<template>
  <fragment>
    <portal to="header">
      <h2>
        Delete
        <strong>
          {{ singletonName }}
        </strong>
      </h2>
    </portal>

    <div class="delete-document-page">
      <el-card>
        <template slot="header">
          <h3>Are you sure you want to delete {{ singletonName }}?</h3>
        </template>
        <div class="dockite-document--detail">
          <p class="dockite-text--subtitle">
            You won't be able to recover this Singleton later on and all corresponding documents
            will be deleted too.
          </p>
        </div>
        <el-row type="flex" justify="space-between">
          <el-button @click.prevent="$router.go(-1)">
            Cancel
          </el-button>
          <el-button type="danger" @click.prevent="handleDeleteSingleton">
            Delete
          </el-button>
        </el-row>
      </el-card>
    </div>
  </fragment>
</template>

<script lang="ts">
// import { Document } from '@dockite/database';
import { Component, Vue, Watch } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import * as data from '~/store/data';
import * as singleton from '~/store/singleton';

@Component({
  components: {
    Fragment,
  },
})
export default class DeleteSingletonPage extends Vue {
  get singletonName(): string {
    return this.$store.getters[`${data.namespace}/getSingletonNameById`](this.singletonId);
  }

  get singletonId(): string {
    return this.$route.params.id;
  }

  public fetchSingletonById(): void {
    this.$store.dispatch(`${data.namespace}/fetchSingletonWithFieldsById`, {
      id: this.singletonId,
    });
  }

  public async handleDeleteSingleton(): Promise<void> {
    await this.$store.dispatch(`${singleton.namespace}/deleteSingleton`, this.singletonId);

    this.$message({
      message: 'Singleton deleted successfully',
      type: 'success',
    });

    this.$router.push('/singletons');
  }

  @Watch('singletonId', { immediate: true })
  handleSingletonIdChange(): void {
    this.fetchSingletonById();
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
</style>
