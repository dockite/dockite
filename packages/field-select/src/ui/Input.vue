<template>
  <el-form-item :label="fieldConfig.title" :prop="name" :rules="rules" class="dockite-field-string">
    <el-select
      v-model="fieldData"
      :multiple="settings.multiple"
      style="width: 100%"
      filterable
      default-first-option
    >
      <el-option v-for="(value, label) in settings.options" :key="value" :value="value">
        {{ label }}
      </el-option>
    </el-select>
    <div class="el-form-item__description">
      {{ fieldConfig.description }}
    </div>
  </el-form-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { SelectFieldSettings, DockiteFieldSelectEntity } from '../types';

@Component({
  name: 'SelectFieldInputComponent',
})
export default class SelectFieldInputComponent extends Vue {
  @Prop({ required: true })
  readonly name!: string;

  @Prop({ required: true })
  readonly value!: string | string[] | null;

  @Prop({ required: true })
  readonly formData!: object;

  @Prop({ required: true })
  readonly fieldConfig!: DockiteFieldSelectEntity;

  public rules: object[] = [];

  get fieldData(): string | string[] | null {
    if (this.value !== null) {
      return this.value;
    }

    return null;
  }

  set fieldData(value) {
    this.$emit('input', value);
  }

  get settings(): SelectFieldSettings {
    return this.fieldConfig.settings;
  }

  beforeMount(): void {
    if (this.settings.multiple && !Array.isArray(this.fieldData)) {
      if (this.fieldData !== null) {
        this.fieldData = [this.fieldData];
      }
    }

    if (!this.settings.multiple && Array.isArray(this.fieldData)) {
      [this.fieldData] = this.fieldData;
    }

    if (this.settings.required) {
      this.rules.push(this.getRequiredRule());
    }
  }

  getRequiredRule(): object {
    return {
      required: true,
      message: `${this.fieldConfig.title} is required`,
      trigger: 'blur',
    };
  }
}
</script>

<style></style>
