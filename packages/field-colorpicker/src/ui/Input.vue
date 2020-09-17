<template>
  <el-form-item
    ref="field"
    :label="fieldConfig.title"
    :prop="name"
    :rules="rules"
    class="dockite-field-colorpicker"
  >
    <el-row type="flex" align="middle">
      <el-color-picker
        v-model="fieldData"
        style="width: 100%;"
        color-format="hex"
        :predefine="fieldConfig.settings.predefinedColors"
      />
    </el-row>
    <div class="el-form-item__description">
      {{ fieldConfig.description }}
    </div>
  </el-form-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { DockiteFieldColorPickerEntity } from '../types';

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
  readonly fieldConfig!: DockiteFieldColorPickerEntity;

  public rules: object[] = [];

  get fieldData(): string | null {
    return this.value;
  }

  set fieldData(value) {
    this.$emit('input', value);
  }

  beforeMount(): void {
    this.rules.push(this.getHexColorRule());

    if (this.fieldConfig.settings.required) {
      this.rules.push(this.getRequiredRule());
    }
  }

  public getRequiredRule(): object {
    return {
      required: true,
      message: `${this.fieldConfig.title} is required`,
      trigger: 'blur',
    };
  }

  public getHexColorRule(): object {
    return {
      pattern: /^#[A-Fa-f-0-9]{6}$/,
      message: `${this.fieldConfig.title} must be a valid hexadecimal color`,
      trigger: 'blur',
    };
  }
}
</script>

<style lang="scss">
.dockite-field-colorpicker {
  .el-color-picker {
    height: 50px;
  }

  .el-color-picker__trigger {
    width: 100%;
    height: 50px;
  }
}
</style>
