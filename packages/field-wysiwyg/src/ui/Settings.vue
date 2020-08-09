<template>
  <fragment>
    <el-form-item label="Required">
      <el-switch v-model="settings.required" />

      <div class="el-form-item__description">
        Controls whether or not the field is required, if set to true the document will not be able
        to be saved without setting the field.
      </div>
    </el-form-item>
    <el-form-item label="Extensions">
      <el-select v-model="settings.extensions" multiple filterable>
        <el-option
          v-for="extension in availableExtensions"
          :key="extension"
          :value="extension"
          :label="extension"
        />
      </el-select>

      <div class="el-form-item__description">
        Controls which extensions are enabled for the editor.
      </div>
    </el-form-item>
  </fragment>
</template>

<script lang="ts">
import { Fragment } from 'vue-fragment';
import { Component, Prop, Vue } from 'vue-property-decorator';

import { WysiwygFieldSettings, AvailableExtensions } from '../types';
import { DockiteFieldWysiwyg } from '..';

@Component({
  name: 'WysiwygFieldSettingsComponent',
  components: {
    Fragment,
  },
})
export default class WysiwygFieldSettingsComponent extends Vue {
  @Prop({ required: true })
  readonly value!: WysiwygFieldSettings;

  @Prop({ required: true })
  readonly rules!: object;

  public availableExtensions = AvailableExtensions;

  get settings(): WysiwygFieldSettings {
    return this.value;
  }

  set settings(value: WysiwygFieldSettings) {
    this.$emit('input', value);
  }

  beforeMount() {
    if (Object.keys(this.settings).length === 0) {
      this.settings = { ...DockiteFieldWysiwyg.defaultOptions };
    }
  }
}
</script>

<style></style>
