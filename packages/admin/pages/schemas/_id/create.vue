<template>
  <fragment>
    <portal to="header">
      <el-row type="flex" justify="space-between" align="middle">
        <h2>
          <span class="font-bold">Create {{ schema && schema.title }}:</span>
          {{ documentIdentifier }}
        </h2>

        <el-button :disabled="loading > 0" @click="submit">
          Create Document
        </el-button>
      </el-row>
    </portal>
    <div v-loading="loading > 0" class="create-schema-document-page el-loading-parent__min-height">
      <document-form
        v-if="schema"
        ref="formEl"
        v-model="form"
        :schema="schema"
        :dirty.sync="dirty"
        :handle-submit="createDocument"
      />

      <el-row type="flex" justify="space-between" align="middle" style="margin-top: 1rem;">
        <el-button type="text" @click="$router.go(-1)">
          Cancel
        </el-button>

        <el-button :disabled="loading > 0" type="primary" @click="submit">
          Create Document
        </el-button>
      </el-row>
    </div>
  </fragment>
</template>

<script lang="ts">
import { Schema } from '@dockite/database';
import { Component, Vue, Watch, Ref } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import DocumentForm from '~/components/base/document-form.vue';
import Logo from '~/components/base/logo.vue';
import * as auth from '~/store/auth';
import * as data from '~/store/data';
import * as document from '~/store/document';

@Component({
  components: {
    DocumentForm,
    Fragment,
    Logo,
  },
})
export default class CreateSchemaDocumentPage extends Vue {
  public form: Record<string, any> = {};

  public ready = false;

  public loading = 0;

  public dirty = false;

  @Ref()
  readonly formEl!: any;

  get schemaId(): string {
    return this.$route.params.id;
  }

  get schemaName(): string {
    return this.schema?.title ?? '';
  }

  get schema(): Schema | null {
    return this.$store.getters[`${data.namespace}/getSchemaWithFieldsById`](this.schemaId);
  }

  get documentIdentifier(): string {
    if (this.form.name) {
      return this.form.name;
    }

    if (this.form.title) {
      return this.form.title;
    }

    if (this.form.identifier) {
      return this.form.identifier;
    }

    return 'Document';
  }

  get user(): string {
    return this.$store.getters[`${auth.namespace}/fullName`];
  }

  public async fetchSchemaById(force = false): Promise<void> {
    try {
      this.loading += 1;

      await this.$store.dispatch(`${data.namespace}/fetchSchemaWithFieldsById`, {
        id: this.schemaId,
        force,
      });
    } catch (_) {
      this.$message({
        message: 'Unable to fetch schema: ' + this.schemaId,
        type: 'error',
      });
    } finally {
      this.$nextTick(() => {
        this.loading -= 1;
      });
    }
  }

  public async createDocument(): Promise<void> {
    await this.$store.dispatch(`${document.namespace}/createDocument`, {
      data: this.form,
      schemaId: this.schemaId,
    });

    this.$message({
      message: 'Document created successfully',
      type: 'success',
    });

    this.$router.push(`/schemas/${this.schemaId}`);
  }

  public async submit(): Promise<void> {
    try {
      this.loading += 1;

      await this.formEl.submit();
    } catch (_) {
    } finally {
      this.$nextTick(() => {
        this.loading -= 1;
      });
    }
  }

  @Watch('schamaId', { immediate: true })
  public async handleSchemaIdChange(): Promise<void> {
    this.ready = false;

    await this.fetchSchemaById();

    this.ready = true;
  }
}
</script>

<style lang="scss">
.create-schema-document-page {
  width: 100%;

  .el-tabs__item {
    padding: 0 !important;
  }

  .el-tab-pane__label {
    padding: 0 20px;

    &.is-warning {
      color: #f56c6c;

      &::after {
        content: '*';
      }
    }
  }
}
</style>
