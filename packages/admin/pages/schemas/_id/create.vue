<template>
  <fragment>
    <portal to="header">
      <el-row type="flex" justify="space-between" align="middle">
        <h2>{{ schemaName }} - Create Document</h2>

        <el-button :disabled="submitting" @click="submit">
          Create Document
        </el-button>
      </el-row>
    </portal>
    <div v-if="ready" class="create-schema-document-page">
      <el-form
        ref="formEl"
        v-loading="submitting"
        label-position="top"
        :model="form"
        @submit.native.prevent="submit"
      >
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
              :schema="schema"
              :groups="groups"
            >
            </component>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <el-row type="flex" justify="space-between" align="middle" style="margin-top: 1rem;">
        <el-button type="text" @click="$router.go(-1)">
          Cancel
        </el-button>

        <el-button :disabled="submitting" type="primary" @click="submit">
          Create Document
        </el-button>
      </el-row>
    </div>
  </fragment>
</template>

<script lang="ts">
import { Schema, Field } from '@dockite/database';
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
export default class CreateSchemaDocumentPage extends Vue {
  public currentTab = 'Default';

  public form: Record<string, any> = {};

  public ready = false;

  public submitting = false;

  @Ref()
  readonly formEl!: Form;

  get schemaId(): string {
    return this.$route.params.id;
  }

  get schemaName(): string {
    return this.schema?.title ?? '';
  }

  get schema(): Schema | null {
    return this.$store.getters[`${data.namespace}/getSchemaWithFieldsById`](this.schemaId);
  }

  get fields(): Field[] {
    if (this.schema) {
      return this.schema.fields;
    }

    return [];
  }

  get groups(): Record<string, string[]> {
    if (this.schema) {
      return this.schema.groups;
    }

    return {};
  }

  get availableTabs(): string[] {
    if (this.schema) {
      return Object.keys(this.schema.groups);
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

  public fetchSchemaById(): Promise<void> {
    return this.$store.dispatch(`${data.namespace}/fetchSchemaWithFieldsById`, {
      id: this.$route.params.id,
    });
  }

  public async submit(): Promise<void> {
    this.submitting = false;

    try {
      await this.formEl.validate();

      await this.$store.dispatch(`${document.namespace}/createDocument`, {
        data: this.form,
        schemaId: this.schemaId,
      });

      this.$message({
        message: 'Document created successfully',
        type: 'success',
      });

      this.$router.push(`/schemas/${this.schemaId}`);
    } catch (_) {
      // It's any's all the way down
      (this.formEl as any).fields
        .filter((f: any): boolean => f.validateState === 'error')
        .slice(0, 3)
        .forEach((f: any): void => {
          const groupName = this.getGroupNameFromFieldName(f.prop);

          setImmediate(() => {
            this.$message({
              message: `${groupName}: ${f.validateMessage}`,
              type: 'warning',
            });
          });
        });
    } finally {
      this.submitting = false;
    }
  }

  @Watch('schamaId', { immediate: true })
  public async handleSchemaIdChange(): Promise<void> {
    this.ready = false;

    await this.fetchSchemaById();
    this.initialiseForm();
    this.currentTab = this.availableTabs[0];

    this.ready = true;
  }
}
</script>

<style></style>
