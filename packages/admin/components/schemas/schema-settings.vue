<template>
  <div class="dockite-schema-settings">
    <label for="fields-to-display" class="el-form-item__label">
      Fields to display
    </label>
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
    <small style="display: block; padding-top: 0.5rem">
      The schema fields to display in the table view. These can be used for filtering and sorting
      the table.
    </small>
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
.dockite-import--editor {
  .CodeMirror {
    box-sizing: border-box;
    line-height: normal;
    padding: 0.5rem 0;
    margin-bottom: 0.25rem;
  }
}
</style>
