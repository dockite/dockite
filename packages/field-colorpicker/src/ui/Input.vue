<template>
  <el-form-item
    ref="field"
    :label="fieldConfig.title"
    :prop="fieldConfig.name"
    class="dockite-field-colorpicker"
  >
    <el-row
      type="flex"
      align="middle"
    >
      <el-color-picker
        v-model="fieldData"
        style="width: 100%;"
        color-format="hex"
      />
    </el-row>
    <div class="el-form-item__description">
      {{ fieldConfig.description }}
    </div>
  </el-form-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Field } from '@dockite/types';

@Component({
  name: 'ColorpickerFieldInputComponent',
})
export default class ColorpickerFieldInputComponent extends Vue {
  @Prop({ required: true })
  readonly name!: string;

  @Prop({ required: true })
  readonly value!: string | null;

  @Prop({ required: true })
  readonly formData!: object;

  @Prop({ required: true })
  readonly fieldConfig!: Field;

  get fieldData(): string | null {
    return this.value;
  }

  set fieldData(value) {
    this.$emit('input', value);
  }

  mounted(): void {
    const rules = [this.getHexColorRule()];

    if (this.fieldConfig.settings.required) rules.push(this.getRequiredRule());

    this.$emit('update:rules', { [this.fieldConfig.name]: rules });
  }


  public getRequiredRule(): object {
    return {
      required: true,
      message: `${this.fieldConfig.title} is required`,
      trigger: 'change',
    };
  }

  public getHexColorRule(): object {
    return {
      pattern: /^#[A-Fa-f-0-9]{6}$/,
      message: `${this.fieldConfig.title} must be a valid hexadecimal color`,
      trigger: 'change',
    };
  }
}
</script>

<style lang="scss">
.dockite-field-colorpicker {
  .el-color-picker__trigger {
    width: 100%;
    height: 50px;
  }
}
</style>
