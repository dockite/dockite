<template>
  <el-form-item
    :label="fieldConfig.title"
    :prop="name"
    :rules="rules"
    class="dockite-field-conditional-boolean"
  >
    <el-switch v-model="fieldData" size="large" />
    <div class="el-form-item__description">
      {{ fieldConfig.description }}
    </div>
  </el-form-item>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { cloneDeep } from 'lodash';

import { DockiteFieldConditionalBooleanEntity } from '../types';

@Component({
  name: 'ConditionalBooleanFieldInputComponent',
})
export default class ConditionalBooleanFieldInputComponent extends Vue {
  @Prop({ required: true })
  readonly name!: string;

  @Prop({ required: true })
  readonly value!: boolean | null;

  @Prop({ required: true })
  readonly formData!: object;

  @Prop({ required: true })
  readonly fieldConfig!: DockiteFieldConditionalBooleanEntity;

  @Prop({ required: true })
  readonly groups!: Record<string, string[]>;

  public groupsBackup: Record<string, string[]> = {};

  public rules: object[] = [];

  get fieldData(): boolean {
    if (this.value !== null) {
      return this.value;
    }

    return false;
  }

  set fieldData(value: boolean) {
    this.$emit('input', value);
  }

  get hidden(): Record<string, string[]> {
    console.log({ fieldConfig: this.fieldConfig });
    return Object.keys(this.groupsBackup).reduce((acc, curr) => {
      if (this.fieldConfig.settings.groupsToHide.includes(curr)) {
        return acc;
      }

      return {
        ...acc,
        [curr]: this.groupsBackup[curr].filter(
          x => !this.fieldConfig.settings.fieldsToHide.includes(x),
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
      console.log({ hidden: JSON.parse(JSON.stringify(this.hidden)) });
      this.$emit('update:groups', cloneDeep(this.groupsBackup));
      this.$emit('update:groups', cloneDeep(this.hidden));
    } else {
      this.$emit('update:groups', cloneDeep(this.groupsBackup));
    }
  }
}
</script>

<style></style>
