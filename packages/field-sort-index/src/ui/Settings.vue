<template>
  <el-form-item label="Reference Field" prop="settings.parentField">
    <el-select
      v-model="settings.parentField"
      filterable
      clearable
      style="width: 100%"
      placeholder="Select the parent field if one exists"
    >
      <el-option
        v-for="field in referenceFields"
        :key="field.name"
        :label="field.title"
        :value="field.name"
      >
        {{ field.name }}
      </el-option>
    </el-select>

    <span class="el-form-item__description">
      The parent field for the schema if it allows for tree relationships.
    </span>
  </el-form-item>
</template>

<script lang="ts">
import { Fragment } from 'vue-fragment';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Field } from '@dockite/database';

import { SortIndexFieldSettings } from '../types';
import { DockiteFieldSortIndex } from '..';

@Component({
  name: 'SortIndexFieldSettingsComponent',
  components: {
    Fragment,
  },
})
export default class SortIndexFieldSettingsComponent extends Vue {
  @Prop({ required: true })
  readonly value!: SortIndexFieldSettings;

  @Prop({ required: true })
  readonly rules!: object;

  @Prop({ required: true })
  readonly fields!: Field[];

  get settings(): SortIndexFieldSettings {
    return this.value;
  }

  set settings(value) {
    this.$emit('input', value);
  }

  get referenceFields(): Field[] {
    return this.fields.filter(f => f.type === 'reference');
  }

  mounted() {
    this.settings = {
      ...DockiteFieldSortIndex.defaultOptions,
      ...this.settings,
    };
  }
}
</script>

<style></style>
