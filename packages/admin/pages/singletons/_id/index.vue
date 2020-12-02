<template>
  <fragment>
    <portal to="header">
      <el-row style="width: 100%" type="flex" justify="space-between" align="middle">
        <h2>
          {{ singletonName }}
        </h2>

        <el-row type="flex" align="middle">
          <el-dropdown class="mr-3">
            <el-button>
              Actions
              <i class="el-icon-arrow-down el-icon--right" />
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="$can(`internal:schema:update`)">
                <router-link :to="`/singletons/${singletonId}/edit`">
                  <i class="el-icon-edit" />
                  Edit
                </router-link>
              </el-dropdown-item>
              <el-dropdown-item v-if="$can(`internal:schema:delete`)">
                <router-link
                  :to="`/singleton/${singletonId}/delete`"
                  style="color: rgb(245, 108, 108)"
                >
                  <i class="el-icon-delete" />
                  Delete
                </router-link>
              </el-dropdown-item>
              <el-dropdown-item divided>
                <router-link :to="`/singletons/${singletonId}/revisions`">
                  <i class="el-icon-folder-opened" />
                  Revisions
                </router-link>
              </el-dropdown-item>
              <el-dropdown-item v-if="$can('internal:schema:update')">
                <router-link :to="`/singletons/${singletonId}/import`">
                  <i class="el-icon-upload2" />
                  Import Singleton
                </router-link>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>

          <el-button :loading="loading > 0" :disabled="!dirty" type="primary" @click="submit">
            Save
          </el-button>
        </el-row>
      </el-row>
    </portal>
    <div v-loading="loading > 0" class="singleton-document-page el-loading-parent__min-height">
      <document-form
        v-if="singleton && singleton.data"
        ref="formEl"
        v-model="form"
        :data="singleton.data"
        :schema="singleton"
        :dirty.sync="dirty"
        :handle-submit="updateSingleton"
      />
    </div>
  </fragment>
</template>

<script lang="ts">
import { Singleton } from '@dockite/database';
import { omit } from 'lodash';
import { Component, Vue, Watch, Ref } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import DocumentForm from '~/components/base/document-form.vue';
import Logo from '~/components/base/logo.vue';
import * as auth from '~/store/auth';
import * as data from '~/store/data';
import * as singleton from '~/store/singleton';

@Component({
  components: {
    DocumentForm,
    Fragment,
    Logo,
  },
})
export default class CreateSingletonDocumentPage extends Vue {
  public form: Record<string, any> = {};

  public ready = false;

  public loading = 0;

  public dirty = false;

  @Ref()
  readonly formEl!: any;

  get singletonId(): string {
    return this.$route.params.id;
  }

  get singletonName(): string {
    return this.singleton?.title ?? '';
  }

  get singleton(): Singleton | null {
    return this.$store.getters[`${data.namespace}/getSingletonWithFieldsById`](this.singletonId);
  }

  get user(): string {
    return this.$store.getters[`${auth.namespace}/fullName`];
  }

  public async fetchSingletonById(): Promise<void> {
    this.loading += 1;

    await this.$store.dispatch(`${data.namespace}/fetchSingletonWithFieldsById`, {
      id: this.$route.params.id,
    });

    this.$nextTick(() => {
      this.loading -= 1;
    });
  }

  public async updateSingleton(): Promise<void> {
    await this.$store.dispatch(`${singleton.namespace}/updateSingletonAndFields`, {
      singleton: {
        ...omit(this.singleton, 'fields'),
        data: this.form,
      },
      fields: [],
      deletedFields: [],
    });

    this.$router.push(`/singletons`);

    this.$message({
      message: 'Singleton updated successfully',
      type: 'success',
    });
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

  @Watch('singletonId', { immediate: true })
  public async handleSingletonIdChange(): Promise<void> {
    this.ready = false;
    this.loading += 1;

    await this.fetchSingletonById();

    this.$nextTick(() => {
      this.loading -= 1;
    });

    this.ready = true;
  }
}
</script>

<style></style>
