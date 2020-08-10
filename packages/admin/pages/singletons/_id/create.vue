<template>
  <fragment>
    <portal to="header">
      <h2>{{ singletonName }} - Create Document</h2>
    </portal>
    <div v-if="ready" class="create-singleton-document-page">
      <el-form ref="formEl" label-position="top" :model="form" @submit.native.prevent="submit">
        <el-tabs v-model="currentTab" type="border-card">
          <el-tab-pane v-for="tab in availableTabs" :key="tab" :label="tab" :name="tab">
            <component
              :is="$dockiteFieldManager[field.type].input"
              v-for="field in getFieldsByGroupName(tab)"
              :key="field.id"
              v-model="form[field.name]"
              :name="field.name"
              :field-config="field"
              :form-data="form"
            >
            </component>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <el-row type="flex" justify="space-between" align="middle" style="margin-top: 1rem;">
        <el-button type="text" @click="$router.go(-1)">
          Cancel
        </el-button>

        <el-button type="primary" @click="submit">
          Create Document
        </el-button>
      </el-row>
    </div>
  </fragment>
</template>

<script lang="ts">
import { Singleton, Field } from '@dockite/database';
import { Form } from 'element-ui';
import { sortBy } from 'lodash';
import { Component, Vue, Watch, Ref } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import Logo from '~/components/base/logo.vue';
import * as auth from '~/store/auth';
import * as data from '~/store/data';
import * as document from '~/store/document';

@Component({
  components: {
    Fragment,
    Logo,
  },
})
export default class CreateSingletonDocumentPage extends Vue {
  public currentTab = 'Default';

  public form: Record<string, any> = {};

  public ready = false;

  @Ref()
  readonly formEl!: Form;

  get singletonId(): string {
    return this.$route.params.id;
  }

  get singletonName(): string {
    return this.singleton?.title ?? '';
  }

  get singleton(): Singleton | null {
    return this.$store.getters[`${data.namespace}/getSingletonWithFieldsById`](this.singletonId);
  }

  get fields(): Field[] {
    if (this.singleton) {
      return this.singleton.fields;
    }

    return [];
  }

  get groups(): Record<string, string[]> {
    if (this.singleton) {
      return this.singleton.groups;
    }

    return {};
  }

  get availableTabs(): string[] {
    if (this.singleton) {
      return Object.keys(this.singleton.groups);
    }

    return [];
  }

  get user(): string {
    return this.$store.getters[`${auth.namespace}/fullName`];
  }

  public getFieldsByGroupName(name: string): Field[] {
    const filteredFields = this.fields.filter(field => this.groups[name].includes(field.name));

    return sortBy(filteredFields, [i => this.groups[name].indexOf(i.name)]);
  }

  public getGroupNameFromFieldName(name: string): string {
    for (const key of Object.keys(this.groups)) {
      if (this.groups[key].includes(name)) {
        return key;
      }
    }

    return '';
  }

  public initialiseForm(): void {
    this.fields.forEach(field => {
      if (!this.form[field.name]) {
        Vue.set(this.form, field.name, field.settings.default ?? null);
      }
    });
  }

  public fetchSingletonById(): Promise<void> {
    return this.$store.dispatch(`${data.namespace}/fetchSingletonWithFieldsById`, {
      id: this.$route.params.id,
    });
  }

  public async submit(): Promise<void> {
    try {
      await this.formEl.validate();

      await this.$store.dispatch(`${document.namespace}/createDocument`, {
        data: this.form,
        singletonId: this.singletonId,
      });

      this.$message({
        message: 'Document created successfully',
        type: 'success',
      });

      this.$router.push(`/singletons/${this.singletonId}`);
    } catch (_) {
      // It's any's all the way down
      (this.formEl as any).fields
        .filter((f: any): boolean => f.validateState === 'error')
        .forEach((f: any): void => {
          const groupName = this.getGroupNameFromFieldName(f.prop);

          this.$message({
            message: `${groupName}: ${f.validateMessage}`,
            type: 'warning',
          });
        });
    }
  }

  @Watch('schamaId', { immediate: true })
  public async handleSingletonIdChange(): Promise<void> {
    this.ready = false;

    await this.fetchSingletonById();
    this.initialiseForm();
    this.currentTab = this.availableTabs[0];

    this.ready = true;
  }
}
</script>

<style></style>
