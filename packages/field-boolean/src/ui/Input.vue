<template>
  <el-form-item
    :label="fieldConfig.title"
    :prop="fieldConfig.name"
    class="dockite-field-boolean"
  >
    <el-switch
      v-model="fieldData"
      size="large"
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
  name: 'BooleanFieldInputComponent',
})
export default class BooleanFieldInputComponent extends Vue {
  @Prop({ required: true })
  readonly name!: string;

  @Prop({ required: true })
  readonly value!: boolean | null;

  @Prop({ required: true })
  readonly formData!: object;

  @Prop({ required: true })
  readonly fieldConfig!: Field;

  get fieldData(): boolean {
    if (this.value !== null) {
      return this.value;
    }

    return false;
  }

  set fieldData(value: boolean) {
    this.$emit('input', value);
  }

  mounted(): void {
    if (this.value === null) {
      this.$emit('input', false);
    }

    const rules = [];

    if (this.fieldConfig.settings.required) rules.push(this.getRequiredRule());

    this.$emit('update:rules', { [this.fieldConfig.name]: rules });
  }

  getRequiredRule(): object {
    return {
      required: true,
      message: `${this.fieldConfig.title} is required`,
      trigger: 'change',
    };
  }
}
</script>

<style></style>
