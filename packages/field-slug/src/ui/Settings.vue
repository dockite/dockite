<template>
  <fragment>
    <el-form-item label="Field to slugify">
      <el-select v-model="settings.fieldToSlugify">
        <el-option
          v-for="field in fields"
          :key="field.name"
          :label="field.title"
          :value="field.name"
        >
          {{ field.title }}
        </el-option>
      </el-select>

      <div class="el-form-item__description">
        The field to slugify, the field selected should be string-like for best results.
      </div>
    </el-form-item>
  </fragment>
</template>

<script lang="ts">
import { Fragment } from 'vue-fragment';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Field } from '@dockite/types';

import { SlugFieldSettings } from '../types';
import { DockiteFieldSlug } from '..';

@Component({
  name: 'SlugFieldSettingsComponent',
  components: {
    Fragment,
  },
})
export default class SlugFieldSettingsComponent extends Vue {
  @Prop({ required: true })
  readonly value!: SlugFieldSettings;

  @Prop({ required: true })
  readonly rules!: object;

  @Prop({ required: true })
  readonly fields!: Omit<Field, 'id' | 'schemaId' | 'dockiteField' | 'schema' | 'setDockiteField'>;

  get settings(): SlugFieldSettings {
    return this.value;
  }

  set settings(value: SlugFieldSettings) {
    this.$emit('input', value);
  }

  beforeMount() {
    if (Object.keys(this.settings).length === 0) {
      this.settings = { ...DockiteFieldSlug.defaultOptions };
    }
  }
}
</script>

<style></style>
