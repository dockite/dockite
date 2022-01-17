<template>
  <el-form-item
    :label="fieldConfig.title"
    :prop="name"
    :rules="rules"
    class="dockite-field-slug"
    :class="{ 'is-error': errors[name] }"
  >
    <el-input v-model="fieldData" @blur="freezeSlug = true" />

    <div v-if="errors[name]" class="el-form-item__error">
      {{ errors[name] }}
    </div>

    <div class="el-form-item__description">
      {{ fieldConfig.description }}
    </div>
  </el-form-item>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import slugify from 'slugify';

import { SlugFieldSettings, DockiteFieldSlugEntity } from '../types';
import { REMOVE_REGEX } from '../constants';

// Remove the charMap to avoid unexpected replacements of symbols
slugify.extend({});

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

  @Prop({ required: true, type: Object })
  readonly errors!: Record<string, string[]>;

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

  get slugifyFormFields(): Record<string, any> {
    return (this.settings.fieldsToSlugify || []).reduce(
      (acc, curr) => ({ ...acc, [curr]: this.formData[curr] }),
      {},
    );
  }

  @Watch('slugifyFormFields', { deep: true })
  handleSlugifyFormFieldsChange() {
    if (this.fieldData === '' || this.fieldData === null) {
      this.freezeSlug = false;
    }

    this.$nextTick(() => {
      if (
        this.settings.fieldsToSlugify &&
        this.settings.fieldsToSlugify.every(field => this.formData[field]) &&
        !this.freezeSlug
      ) {
        this.fieldData = slugify(
          this.settings.fieldsToSlugify.map(field => String(this.formData[field]).trim()).join('-'),
          {
            lower: true,
            replacement: '-',
            remove: REMOVE_REGEX,
          },
        );
      }
    });
  }
}
</script>

<style></style>
