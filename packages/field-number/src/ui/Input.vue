<template>
  <el-form-item
    :label="fieldConfig.title"
    :colon="true"
    :prop="fieldConfig.name"
    class="dockite-field-number"
  >
    <el-input-number
      v-model.number="fieldData"
      style="width: 100%;"
      :step="step"
      :precision="precision"
      controls-position="right"
      type="number"
      :min="min"
      :max="max"
    />
  </el-form-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Field } from '@dockite/types';

@Component({
  name: 'NumberFieldInputComponent',
})
export default class NumberFieldInputComponent extends Vue {
  @Prop({ required: true })
  readonly name!: string;

  @Prop({ required: true })
  readonly value!: number | null;

  @Prop({ required: true })
  readonly formData!: object;

  @Prop({ required: true })
  readonly fieldConfig!: Field;

  get fieldData(): number {
    if (this.value !== null) {
      return this.value;
    }

    return 0;
  }

  set fieldData(value) {
    this.$emit('input', value);
  }

  get settings(): { min?: number; max?: number } {
    return this.fieldConfig.settings;
  }

  get min(): number {
    return this.settings.min ?? -Infinity;
  }

  get max(): number {
    return this.settings.max ?? Infinity;
  }

  get step(): number {
    if (this.fieldConfig.settings.float) {
      return 0.01;
    }

    return 1;
  }

  get precision(): number {
    if (this.fieldConfig.settings.float) {
      return 2;
    }

    return 0;
  }

  public mounted(): void {
    if (this.value === null) {
      this.$emit('input', false);
    }

    const rules = [];

    if (this.fieldConfig.settings.required) rules.push(this.getRequiredRule());
    if (!this.fieldConfig.settings.float) rules.push(this.getIntRule());
    if (this.fieldConfig.settings.float) rules.push(this.getFloatRule());
    if (this.fieldConfig.settings.min) rules.push(this.getMinRule());
    if (this.fieldConfig.settings.max) rules.push(this.getMaxRule());

    this.$emit('update:rules', { [this.fieldConfig.name]: rules });
  }

  public getRequiredRule(): object {
    return {
      required: true,
      message: `${this.fieldConfig.title} is required`,
      trigger: 'blur',
    };
  }

  public getIntRule(): object {
    return {
      type: 'integer',
      message: `${this.fieldConfig.title} must be a whole number`,
      trigger: 'blur',
    };
  }

  public getFloatRule(): object {
    return {
      type: 'number',
      message: `${this.fieldConfig.title} must be a floating point number`,
      trigger: 'blur',
    };
  }

  public getMaxRule(): object {
    const max = this.fieldConfig.settings.max ?? Infinity;

    return {
      validator(_rule: never, value: number, callback: Function) {
        if (Number(value) > max) {
          return callback(new Error('bad'));
        }

        return callback();
      },
      message: `${this.fieldConfig.title} should be less than ${max}`,
      trigger: 'blur',
    };
  }

  public getMinRule(): object {
    const min = this.fieldConfig.settings.min ?? -Infinity;

    return {
      validator(_rule: never, value: number, callback: Function) {
        if (Number(value) < min) {
          return callback(new Error('bad'));
        }

        return callback();
      },
      message: `${this.fieldConfig.title} should be greater than ${min}`,
      trigger: 'blur',
    };
  }
}
</script>

<style lang="scss">
.dockite-field-number .el-input-number .el-input__inner {
  text-align: left;
}
</style>
