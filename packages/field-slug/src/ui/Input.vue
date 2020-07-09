<template>
  <el-form-item :label="fieldConfig.title" :prop="name" :rules="rules" class="dockite-field-string">
    <el-input v-model="fieldData" />
    <el-switch v-model="freezeSlug" :active-text="`Freeze ${fieldConfig.title}`"></el-switch>

    <div class="el-form-item__description">
      {{ fieldConfig.description }}
    </div>
  </el-form-item>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Field } from '@dockite/types';
import slugify from 'slugify';

import { SlugFieldSettings } from '../types';

@Component({
  name: 'SlugFieldInputComponent',
})
export default class SlugFieldInputComponent extends Vue {
  @Prop({ required: true })
  readonly name!: string;

  @Prop({ required: true })
  readonly value!: string | null;

  @Prop({ required: true })
  readonly formData!: Record<string, any>;

  @Prop({ required: true })
  readonly fieldConfig!: Field;

  public freezeSlug = true;

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

  get settings(): SlugFieldSettings {
    return this.fieldConfig.settings;
  }

  beforeMount() {
    if (this.fieldData !== null) {
      this.freezeSlug = true;
    } else {
      this.freezeSlug = false;
    }
  }

  @Watch('formData', { deep: true })
  handleFormDataChange() {
    if (
      this.settings.fieldToSlugify &&
      this.formData[this.settings.fieldToSlugify] &&
      !this.freezeSlug
    ) {
      this.fieldData = slugify(String(this.formData[this.settings.fieldToSlugify]), {
        lower: true,
        replacement: '-',
      });
    }
  }
}
</script>

<style></style>
