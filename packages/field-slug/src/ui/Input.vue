<template>
  <el-form-item :label="fieldConfig.title" :prop="name" :rules="rules" class="dockite-field-slug">
    <el-input v-model="fieldData" />

    <div class="el-form-item__description">
      {{ fieldConfig.description }}
    </div>
  </el-form-item>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import slugify from 'slugify';

import { SlugFieldSettings, DockiteFieldSlugEntity } from '../types';

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
  readonly fieldConfig!: DockiteFieldSlugEntity;

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
    if (this.fieldData !== null && this.fieldData !== '') {
      this.freezeSlug = true;
    } else {
      this.freezeSlug = false;
    }
  }

  @Watch('formData', { deep: true })
  handleFormDataChange() {
    if (this.fieldData === '') {
      this.freezeSlug = false;
    }

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
