<template>
  <el-form-item
    :label="fieldConfig.title"
    :prop="name"
    :rules="rules"
    class="dockite-field-datetime"
  >
    <el-date-picker
      v-if="settings.date"
      v-model="fieldData"
      :format="settings.format"
      value-format="yyyy-MM-dd"
      editable
      clearable
      type="date"
    />
    <el-time-picker
      v-else-if="settings.time"
      v-model="fieldData"
      :format="settings.format"
      editable
      clearable
    />
    <el-date-picker
      v-else
      v-model="fieldData"
      :format="settings.format"
      editable
      clearable
      type="datetime"
    />

    <div class="el-form-item__description">
      {{ fieldConfig.description }}
    </div>
  </el-form-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { DateFieldSettings, DockiteFieldDateTimeEntity } from '../types';

@Component({
  name: 'DateTimeFieldInputComponent',
})
export default class DateTimeFieldInputComponent extends Vue {
  @Prop({ required: true })
  readonly name!: string;

  @Prop({ required: true })
  readonly value!: string | null;

  @Prop({ required: true })
  readonly formData!: object;

  @Prop({ required: true })
  readonly fieldConfig!: DockiteFieldDateTimeEntity;

  public rules: object[] = [];

  get fieldData(): string | null {
    return this.value;
  }

  set fieldData(value) {
    this.$emit('input', value);
  }

  get settings(): DateFieldSettings {
    return this.fieldConfig.settings;
  }

  mounted() {
    if (this.fieldConfig.settings.required) {
      this.rules.push(this.getRequiredRule());
    }

    if (this.fieldConfig.settings.date) {
      this.rules.push(this.getDateRule());
    }

    if (!this.fieldConfig.settings.date) {
      this.rules.push(this.getDateTimeRule());
    }
  }

  public getRequiredRule(): object {
    return {
      required: true,
      message: `${this.fieldConfig.title} is required`,
      trigger: 'blur',
    };
  }

  public getDateTimeRule(): object {
    const { settings } = this;

    return {
      validator(_rule: never, value: string | null, callback: Function) {
        const date = new Date(String(value));

        if (Number.isNaN(date.getTime()) && settings.required) {
          callback(false);
        }

        callback();
      },
      message: `${this.fieldConfig.title} must be a valid datetime`,
      trigger: 'blur',
    };
  }

  public getDateRule(): object {
    const { settings } = this;

    return {
      validator(_rule: never, value: string | null, callback: Function) {
        const date = new Date(String(value));

        if (Number.isNaN(date.getTime()) && settings.required) {
          callback(false);
        }

        callback();
      },
      message: `${this.fieldConfig.title} must be a valid date`,
      trigger: 'blur',
    };
  }
}
</script>

<style lang="scss">
.dockite-field-datetime {
  .el-date-editor.el-input {
    width: 100%;
  }
}
</style>
