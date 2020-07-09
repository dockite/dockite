<template>
  <el-form-item :label="fieldConfig.title" :prop="name" :rules="rules" class="dockite-field-string">
    <el-input
      v-if="settings.textarea"
      v-model="fieldData"
      type="textarea"
      :auto-size="{ minRows: 3, maxRows: 5 }"
      :allow-clear="true"
    />
    <el-input v-else v-model="fieldData" />
    <div class="el-form-item__description">
      {{ fieldConfig.description }}
    </div>
  </el-form-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Field } from '@dockite/types';

import { StringFieldSettings } from '../types';

@Component({
  name: 'StringFieldInputComponent',
})
export default class StringFieldInputComponent extends Vue {
  @Prop({ required: true })
  readonly name!: string;

  @Prop({ required: true })
  readonly value!: string | null;

  @Prop({ required: true })
  readonly formData!: object;

  @Prop({ required: true })
  readonly fieldConfig!: Field;

  public rules: object[] = [];

  get fieldData(): string {
    if (this.value !== null) {
      return this.value;
    }

    return '';
  }

  set fieldData(value: string) {
    this.$emit('input', value);
  }

  get settings(): StringFieldSettings {
    return this.fieldConfig.settings;
  }

  beforeMount(): void {
    if (this.value === null) {
      this.$emit('input', '');
    }

    if (this.settings.required) {
      this.rules.push(this.getRequiredRule());
    }

    if (this.settings.urlSafe) {
      this.rules.push(this.getUrlSafeRule());
    }

    if (this.settings.minLen) {
      this.rules.push(this.getMinRule());
    }

    if (this.settings.maxLen) {
      this.rules.push(this.getMaxRule());
    }
  }

  getUrlSafeRule(): object {
    return {
      pattern: /^[A-Za-z0-9-_]+$/,
      message: `${this.fieldConfig.title} must be URL Safe`,
      trigger: 'blur',
    };
  }

  getRequiredRule(): object {
    return {
      required: true,
      message: `${this.fieldConfig.title} is required`,
      trigger: 'blur',
    };
  }

  getMinRule(): object {
    return {
      min: Number(this.settings.minLen),
      message: `${this.fieldConfig.title} must contain atleast ${this.settings.minLen} characters.`,
      trigger: 'blur',
    };
  }

  getMaxRule(): object {
    return {
      max: Number(this.settings.maxLen),
      message: `${this.fieldConfig.title} must contain no more than ${this.settings.maxLen} characters.`,
      trigger: 'blur',
    };
  }
}
</script>

<style></style>
