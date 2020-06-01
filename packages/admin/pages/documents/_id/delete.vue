<template>
  <fragment>
    <portal to="header">
      <h2>
        Delete
        <strong>
          {{ documentId }}
        </strong>
      </h2>
    </portal>

    <div class="delete-document-page">
      <el-card>
        <template slot="header">
          <h3>Are you sure you want to delete {{ documentId }}?</h3>
        </template>
        <div class="dockite-document--detail">
          <el-collapse>
            <el-collapse-item title="Details">
              <pre class="dockite-data--raw">{{ documentRaw }}</pre>
            </el-collapse-item>
          </el-collapse>
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
import { Document } from '@dockite/types';
import { Component, Vue, Watch } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import * as data from '~/store/data';

@Component({
  components: {
    Fragment,
  },
})
export default class EditDocumentPage extends Vue {
  get document(): Document | null {
    return this.$store.getters[`${data.namespace}/getDocumentById`](this.documentId);
  }

  get documentRaw(): string {
    return JSON.stringify(this.document, null, 2);
  }

  get documentId(): string {
    return this.$route.params.id;
  }

  public fetchDocumentById(): void {
    this.$store.dispatch(`${data.namespace}/fetchDocumentById`, { id: this.documentId });
  }

  @Watch('documentId', { immediate: true })
  handleDocumentIdChange(): void {
    this.fetchDocumentById();
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
