<template>
  <el-form-item :label="fieldConfig.title" :prop="name" :rules="rules" class="dockite-field-string">
    <el-select
      v-model="fieldData"
      :multiple="settings.multiple"
      style="width: 100%"
      filterable
      default-first-option
    >
      <el-option
        v-for="(value, label) in settings.options"
        :key="value.value"
        :value="value.value"
        :label="label"
      />
    </el-select>
    <div class="el-form-item__description">
      {{ fieldConfig.description }}
    </div>
  </el-form-item>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { cloneDeep } from 'lodash';

import {
  DockiteFieldConditionalSelectEntity,
  ConditionalSelectFieldSettings,
  ConditionalSelectFieldOptionValue,
} from '../types';

@Component({
  name: 'ConditionalSelectFieldInputComponent',
})
export default class ConditionalSelectFieldInputComponent extends Vue {
  @Prop({ required: true })
  readonly name!: string;

  @Prop({ required: true })
  readonly value!: string | null;

  @Prop({ required: true })
  readonly formData!: object;

  @Prop({ required: true })
  readonly fieldConfig!: DockiteFieldConditionalSelectEntity;

  @Prop({ required: true })
  readonly groups!: Record<string, string[]>;

  public groupsBackup: Record<string, string[]> = {};

  public rules: object[] = [];

  get fieldData(): string | null {
    return this.value;
  }

  set fieldData(value: string | null) {
    this.$emit('input', value);
  }

  get settings(): ConditionalSelectFieldSettings {
    return this.fieldConfig.settings;
  }

  get currentHideConfig(): Omit<ConditionalSelectFieldOptionValue, 'value'> {
    if (!this.fieldData) {
      return {
        fieldsToHide: [],
        groupsToHide: [],
      };
    }

    const currentSelection = Object.values(this.settings.options).find(
      x => x.value === this.fieldData,
    );

    if (!currentSelection) {
      return {
        fieldsToHide: [],
        groupsToHide: [],
      };
    }

    return currentSelection;
  }

  get hidden(): Record<string, string[]> {
    return Object.keys(this.groupsBackup).reduce((acc, curr) => {
      if (this.currentHideConfig.groupsToHide.includes(curr)) {
        return acc;
      }

      return {
        ...acc,
        [curr]: this.groupsBackup[curr].filter(
          x => !this.currentHideConfig.fieldsToHide.includes(x),
        ),
      };
    }, {});
  }

  beforeMount(): void {
    if (this.value === null) {
      this.$emit('input', false);
    }

    if (this.fieldConfig.settings.required) {
      this.rules.push(this.getRequiredRule());
    }

    this.groupsBackup = cloneDeep(this.groups);
  }

  getRequiredRule(): object {
    return {
      required: true,
      message: `${this.fieldConfig.title} is required`,
      trigger: 'blur',
    };
  }

  @Watch('fieldData', { immediate: true })
  public handleFieldDataChange(newValue: boolean) {
    if (newValue) {
      this.$emit('update:groups', cloneDeep(this.groupsBackup));
      this.$emit('update:groups', cloneDeep(this.hidden));
    } else {
      this.$emit('update:groups', cloneDeep(this.groupsBackup));
    }
  }
}
</script>

<style></style>
