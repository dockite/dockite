<template>
  <div class="dockite-schema--settings">
    <el-form label-position="top" @submit.native.prevent>
      <el-form-item label="Fields to Display">
        <el-select
          id="fields-to-display"
          v-model="fieldsToDisplay"
          style="width: 100%;"
          multiple
          filterable
          default-first-option
        >
          <el-option
            v-for="field in schemaFields"
            :key="field.name"
            :label="field.title"
            :value="field.name"
          />
        </el-select>
        <div class="el-form-item__description">
          The schema fields to display in the table view. These can be used for filtering and
          sorting the table.
        </div>
      </el-form-item>

      <el-form-item label="Enable Mutations?">
        <el-switch v-model="settings.enableMutations" />
        <div class="el-form-item__description">
          Whether or not mutations are enabled for the schema, mutations will allow consumers to
          perform create, update and delete actions against schema items provided they are
          authenticated.
        </div>
      </el-form-item>

      <el-form-item v-show="settings.enableMutations" label="Enable Create Mutation?">
        <el-switch v-model="settings.enableCreateMutation" />
        <div class="el-form-item__description">
          Enables the create mutation which will allow consumers to create {{ schema.title }}(s).
        </div>
      </el-form-item>

      <el-form-item v-show="settings.enableMutations" label="Enable Update Mutation?">
        <el-switch v-model="settings.enableUpdateMutation" />
        <div class="el-form-item__description">
          Enables the update mutation which will allow consumers to update {{ schema.title }}(s).
        </div>
      </el-form-item>

      <el-form-item v-show="settings.enableMutations" label="Enable Delete Mutation?">
        <el-switch v-model="settings.enableDeleteMutation" />
        <div class="el-form-item__description">
          Enables the delete mutation which will allow consumers to delete {{ schema.title }}(s).
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { Schema } from '@dockite/database';
import { defaultsDeep, cloneDeep, isEqual } from 'lodash';
import { Component, Prop, Vue } from 'nuxt-property-decorator';

@Component
export default class SchemaSettingsComponent extends Vue {
  @Prop()
  readonly value!: Record<string, any>;

  @Prop()
  readonly schema!: Schema;

  get schemaFields(): { name: string; title: string }[] {
    if (this.schema?.fields) {
      return this.schema.fields.map(({ name, title }) => ({ name, title }));
    }

    return [];
  }

  get settings(): Record<string, any> {
    return this.value;
  }

  set settings(value: Record<string, any>) {
    this.$emit('input', value);
  }

  get fieldsToDisplay(): string[] {
    return this.value.fieldsToDisplay;
  }

  set fieldsToDisplay(value: string[]) {
    this.$emit('input', {
      ...this.value,
      fieldsToDisplay: value,
    });
  }

  beforeMount(): void {
    const valueWithDefaults = defaultsDeep(cloneDeep(this.value), {
      fieldsToDisplay: [],
    });

    if (!isEqual(valueWithDefaults, this.value)) {
      this.$emit('input', valueWithDefaults);
    }
  }
}
</script>

<style lang="scss">
.dockite-schema--settings {
  .el-form-item__label {
    line-height: 1;
  }
}
</style>
