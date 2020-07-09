<template>
  <fragment>
    <el-form-item label="Required">
      <el-switch v-model="settings.required" />

      <div class="el-form-item__description">
        Controls whether or not the field is required, if set to true the document will not be able
        to be saved without setting the field.
      </div>
    </el-form-item>
    <el-form-item label="URL Safe">
      <el-switch v-model="settings.urlSafe" />

      <div class="el-form-item__description">
        Controls whether or not the field should be URL safe, if set to true the field must only
        contain alphanumeric characters or the following: - _ +
      </div>
    </el-form-item>
    <el-form-item label="Textarea">
      <el-switch v-model="settings.textarea" />

      <div class="el-form-item__description">
        Controls whether the field is shown as a textarea or a simple text input.
      </div>
    </el-form-item>
    <el-form-item label="Min Length">
      <el-input-number v-model="settings.minLen" :min="0" />

      <div class="el-form-item__description">
        Sets the minimum length for the field, if set to a number above 0 the field must contain at
        least that many characters.
      </div>
    </el-form-item>
    <el-form-item label="Max Length">
      <el-input-number v-model="settings.maxLen" :min="0" />

      <div class="el-form-item__description">
        Sets the maximum length for the field, if set to a number above 0 the field must contain at
        most that many characters.
      </div>
    </el-form-item>
  </fragment>
</template>

<script lang="ts">
import { Fragment } from 'vue-fragment';
import { Component, Prop, Vue } from 'vue-property-decorator';

import { StringFieldSettings } from '../types';
import { DockiteFieldString } from '..';

@Component({
  name: 'StringFieldSettingsComponent',
  components: {
    Fragment,
  },
})
export default class StringFieldSettingsComponent extends Vue {
  @Prop({ required: true })
  readonly value!: StringFieldSettings;

  @Prop({ required: true })
  readonly rules: object;

  get settings(): StringFieldSettings {
    return this.value;
  }

  set settings(value: StringFieldSettings) {
    this.$emit('input', value);
  }

  beforeMount() {
    if (Object.keys(this.settings).length === 0) {
      this.settings = { ...DockiteFieldString.defaultOptions };
    }
  }
}
</script>

<style></style>
