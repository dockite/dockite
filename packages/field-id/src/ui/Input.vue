<template>
  <el-form-item :label="fieldConfig.title" :prop="name" :rules="rules" class="dockite-field-id">
    <el-input-number v-if="settings.type === 'number'" :disabled="true" :value="fieldData" />
    <el-input v-else :disabled="true" :value="fieldData" />
    <div class="el-form-item__description">
      {{ fieldConfig.description }}
    </div>
  </el-form-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { IDFieldSettings, DockiteFieldIDEntity } from '../types';

@Component({
  name: 'IDFieldInputComponent',
})
export default class IDFieldInputComponent extends Vue {
  @Prop({ required: true })
  readonly name!: string;

  @Prop({ required: true })
  readonly value!: string | number | null;

  @Prop({ required: true })
  readonly formData!: object;

  @Prop({ required: true })
  readonly fieldConfig!: DockiteFieldIDEntity;

  public rules: object[] = [];

  get fieldData(): string | number {
    if (this.value !== null) {
      return this.value;
    }

    if (this.settings.type === 'number') {
      return 0;
    }

    return '';
  }

  set fieldData(value) {
    this.$emit('input', value);
  }

  get settings(): IDFieldSettings {
    return this.fieldConfig.settings;
  }

  beforeMount(): void {
    if (this.value === null) {
      if (this.settings.type === 'number') {
        this.$emit('input', 0);
      } else {
        this.$emit('input', '');
      }
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
