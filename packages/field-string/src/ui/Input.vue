<template>
  <el-form-item
    :label="fieldConfig.title"
    :prop="fieldConfig.name"
    class="dockite-field-string"
  >
    <el-input
      v-if="fieldConfig.settings.textarea"
      v-model="fieldData"
      type="textarea"
      :auto-size="{ minRows: 3, maxRows: 5 }"
      :allow-clear="true"
    />
    <el-input
      v-else
      v-model="fieldData"
    />
    <div class="el-form-item__description">
      {{ fieldConfig.description }}
    </div>
  </el-form-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Field } from '@dockite/types';

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

  get fieldData(): string {
    if (this.value !== null) {
      return this.value;
    }

    return '';
  }

  set fieldData(value: string) {
    this.$emit('input', value);
  }

  mounted(): void {
    if (this.value === null) {
      this.$emit('input', '');
    }

    const rules = [];

    if (this.fieldConfig.settings.required) rules.push(this.getRequiredRule());
    if (this.fieldConfig.settings.urlSafe) rules.push(this.getUrlSafeRule());
    if (this.fieldConfig.settings.minLen) rules.push(this.getMinRule());
    if (this.fieldConfig.settings.maxLen) rules.push(this.getMaxRule());

    this.$emit('update:rules', { [this.fieldConfig.name]: rules });
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
      min: Number(this.fieldConfig.settings.minLen),
      message: `${this.fieldConfig.title} must contain atleast ${this.fieldConfig.settings.minLen} characters.`,
      trigger: 'blur',
    };
  }

  getMaxRule(): object {
    return {
      max: Number(this.fieldConfig.settings.maxLen),
      message: `${this.fieldConfig.title} must contain no more than ${this.fieldConfig.settings.maxLen} characters.`,
      trigger: 'blur',
    };
  }
}
</script>

<style></style>
