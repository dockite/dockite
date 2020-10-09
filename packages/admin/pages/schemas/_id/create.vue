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
      <el-form
        v-if="ready"
        ref="formEl"
        label-position="top"
        :model="form"
        @submit.native.prevent="submit"
      >
        <el-tabs v-model="currentTab" type="border-card">
          <el-tab-pane v-for="tab in availableTabs" :key="tab" class="test" :name="tab">
            <div slot="label" class="el-tab-pane__label" :class="{ 'is-warning': tabErrors[tab] }">
              {{ tab }}
            </div>

            <div v-for="field in getFieldsByGroupName(tab)" :key="field.id">
              <component
                :is="$dockiteFieldManager[field.type].input"
                v-if="$dockiteFieldManager[field.type].input && !field.settings.hidden"
                v-model="form[field.name]"
                :name="field.name"
                :field-config="field"
                :form-data="form"
                :schema="schema"
                :groups="groups"
                :errors="validationErrors"
              />
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-form>
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
import { Schema, Field } from '@dockite/database';
import { Form } from 'element-ui';
import { GraphQLError } from 'graphql';
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

  public tabErrors: Record<string, boolean> = {};

  public validationErrors: Record<string, boolean> = {};

  public ready = false;

  public loading = 0;

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
      if (this.form[field.name] === undefined) {
        Vue.set(this.form, field.name, field.settings.default ?? null);
      }
    });
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

  public async submit(): Promise<void> {
    try {
      this.validationErrors = {};
      this.tabErrors = {};

      this.loading += 1;

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
    } catch (err) {
      if (err.graphQLErrors && err.graphQLErrors.length > 0) {
        const error: GraphQLError = err.graphQLErrors.pop();

        console.log(err);

        if (
          error.extensions &&
          error.extensions.code &&
          error.extensions.code === 'VALIDATION_ERROR'
        ) {
          const errors = error.extensions.errors;

          this.validationErrors = errors;

          const entries = Object.entries(errors);

          entries.forEach((entry: any): void => {
            const [key] = entry;
            const groupName = this.getGroupNameFromFieldName(key.split('.').shift());

            Vue.set(this.tabErrors, groupName, true);
          });

          entries.slice(0, 4).forEach((entry: any): void => {
            const [key, value] = entry;

            const groupName = this.getGroupNameFromFieldName(key.split('.').shift());

            setImmediate(() => {
              this.$message({
                message: `${groupName}: ${value}`,
                type: 'warning',
              });
            });
          });

          if (entries.length > 4) {
            setImmediate(() => {
              this.$message({
                message: `And ${entries.length - 4} more errors`,
                type: 'warning',
              });
            });
          }
        }
      } else {
        // It's any's all the way down
        const errors = (this.formEl as any).fields.filter(
          (f: any): boolean => f.validateState === 'error',
        );

        errors.forEach((f: any): void => {
          const groupName = this.getGroupNameFromFieldName(f.prop.split('.').shift());

          Vue.set(this.tabErrors, groupName, true);
        });

        errors.slice(0, 4).forEach((f: any): void => {
          const groupName = this.getGroupNameFromFieldName(f.prop.split('.').shift());

          setImmediate(() => {
            this.$message({
              message: `${groupName}: ${f.validateMessage}`,
              type: 'warning',
            });
          });
        });

        if (errors.length > 4) {
          setImmediate(() => {
            this.$message({
              message: `And ${errors.length - 4} more errors`,
              type: 'warning',
            });
          });
        }
      }
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
    this.initialiseForm();
    this.currentTab = this.availableTabs[0];

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
