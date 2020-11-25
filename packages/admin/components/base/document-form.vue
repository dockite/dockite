<template>
  <el-form ref="formEl" label-position="top" :model="form" @submit.native.prevent="submit">
    <el-tabs v-model="currentTab" type="border-card">
      <el-tab-pane v-for="tab in availableTabs" :key="tab" :name="tab">
        <div
          slot="label"
          class="el-tab-pane__label"
          :class="{ 'is-warning': tabErrors.includes(tab) }"
        >
          {{ tab }}
        </div>

        <div v-for="field in getFieldsByGroupName(tab)" :key="field.id">
          <component
            :is="$dockiteFieldManager[field.type].input"
            v-if="
              $dockiteFieldManager[field.type].input &&
                !field.settings.hidden &&
                form[field.name] !== undefined
            "
            v-model="form[field.name]"
            :errors="validationErrors"
            :name="field.name"
            :field-config="field"
            :form-data="form"
            :schema="schema"
            :groups.sync="groups"
          />
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-form>
</template>

<script lang="ts">
import { Schema, Field } from '@dockite/database';
import { GraphQLError } from 'graphql';
import { sortBy, uniq, cloneDeep } from 'lodash';
import { Component, Prop, Vue, Watch, Ref } from 'nuxt-property-decorator';

@Component({
  name: 'DocumentFormComponent',
})
export default class DocumentFormComponent extends Vue {
  @Prop({ required: true, type: Object })
  readonly value!: Record<string, any>;

  @Prop({ required: true })
  readonly dirty!: boolean;

  @Prop({ required: true, type: Object })
  readonly schema!: Schema;

  @Prop({ default: () => ({}), type: Object })
  readonly data!: Record<string, any>;

  @Prop({ required: true, type: Function })
  readonly handleSubmit!: Function;

  @Ref()
  readonly formEl!: any;

  public ready = false;

  public currentTab = 'Default';

  public localGroups: Record<string, string[]> | null = null;

  public validationErrors: Record<string, string> = {};

  get form(): Record<string, any> {
    if (!this.value) {
      return {};
    }

    return this.value;
  }

  set form(value) {
    this.$emit('input', value);
  }

  get dirtySync(): boolean {
    return this.dirty;
  }

  set dirtySync(value) {
    this.$emit('update:dirty', value);
  }

  get fields(): Field[] {
    return this.schema.fields;
  }

  get groups(): Record<string, string[]> {
    if (this.localGroups && Object.keys(this.localGroups).length > 0) {
      return this.localGroups;
    }

    if (this.schema) {
      return this.schema.groups;
    }

    return {};
  }

  set groups(value: Record<string, string[]>) {
    this.localGroups = { ...value };
  }

  get availableTabs(): string[] {
    if (this.localGroups && Object.keys(this.localGroups).length > 0) {
      return Object.keys(this.localGroups);
    }

    if (this.schema) {
      return Object.keys(this.schema.groups);
    }

    return [];
  }

  get tabErrors(): string[] {
    return uniq(Object.keys(this.validationErrors).map(x => this.getGroupNameFromFieldName(x)));
  }

  public getFieldsByGroupName(name: string): Field[] {
    const filteredFields = this.fields.filter(field => this.groups[name].includes(field.name));

    return sortBy(filteredFields, [i => this.groups[name].indexOf(i.name)]);
  }

  public getGroupNameFromFieldName(name: string): string {
    const [baseName] = name.split('.');

    for (const key of Object.keys(this.groups)) {
      if (this.groups[key].includes(baseName)) {
        return key;
      }
    }

    return '';
  }

  public createFormData(): void {
    this.ready = false;

    const form = { ...this.form, ...cloneDeep(this.data) };

    this.fields.forEach(field => {
      if (form[field.name] === undefined) {
        form[field.name] = field.settings.default ?? null;
      }
    });

    this.form = form;

    this.$nextTick(() => {
      this.dirtySync = false;

      this.ready = true;
    });
  }

  public async submit(): Promise<void> {
    try {
      this.validationErrors = {};

      await this.formEl.validate();

      await this.handleSubmit();
    } catch (err) {
      if (err.graphQLErrors && err.graphQLErrors.length > 0) {
        const error: GraphQLError = err.graphQLErrors.pop();

        if (
          error.extensions &&
          error.extensions.code &&
          error.extensions.code === 'VALIDATION_ERROR'
        ) {
          const errors = error.extensions.errors;

          this.validationErrors = errors;

          const entries = Object.entries(errors);

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
    }
  }

  @Watch('schema', { deep: true })
  public handleSchemaChange(): void {
    this.createFormData();

    this.currentTab = this.availableTabs[0] ?? 'Default';
  }

  @Watch('form', { deep: true })
  public handleFormChange(): void {
    this.dirtySync = true;
  }

  public mounted(): void {
    this.handleSchemaChange();
  }
}
</script>

<style></style>
