<template>
  <fragment>
    <el-form-item label="Required">
      <el-switch v-model="settings.required" />
    </el-form-item>

    <el-form-item label="Fields to Hide">
      <el-select
        v-model="settings.fieldsToHide"
        multiple
        filterable
        placeholder="Fields to Hide"
        class="w-full mb-2"
      >
        <el-option
          v-for="field in allFields"
          :key="field.name"
          :label="field.title"
          :value="field.name"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="Groups to Hide">
      <el-select
        v-model="settings.groupsToHide"
        multiple
        filterable
        placeholder="Groups to Hide"
        class="w-full mb-2"
      >
        <el-option v-for="group in allGroups" :key="group" :label="group" :value="group" />
      </el-select>
    </el-form-item>
  </fragment>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Fragment } from 'vue-fragment';
import { Field } from '@dockite/database';

import { ConditionalBooleanSettings } from '../types';
import { DockiteFieldConditionalBoolean } from '..';

@Component({
  name: 'ConditionalBooleanFieldInputComponent',
  components: {
    Fragment,
  },
})
export default class BooleanFieldInputComponent extends Vue {
  @Prop()
  readonly value!: ConditionalBooleanSettings;

  @Prop()
  readonly groups!: Record<string, string[]>;

  @Prop()
  readonly fields!: Field[];

  get settings(): ConditionalBooleanSettings {
    return this.value;
  }

  set settings(value: ConditionalBooleanSettings) {
    this.$emit('input', value);
  }

  get allGroups(): string[] {
    return Object.keys(this.groups);
  }

  get allFields(): Field[] {
    const allFieldNames = Object.values(this.groups).reduce((acc, curr) => [...acc, ...curr], []);

    return this.fields.filter(field => allFieldNames.includes(field.name));
  }

  public mounted(): void {
    if (Object.keys(this.settings).length === 0) {
      this.settings = {
        ...DockiteFieldConditionalBoolean.defaultOptions,
      };
    }
  }
}
</script>

<style></style>
