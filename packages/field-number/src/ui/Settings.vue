<template>
  <fragment>
    <el-form-item label="Required" prop="settings.required">
      <el-switch v-model="settings.required" />
    </el-form-item>
    <el-form-item label="Float" prop="settings.float">
      <el-switch v-model="settings.float" />
    </el-form-item>
    <el-form-item label="Min Value" prop="settings.min">
      <el-input-number v-model="settings.min" />
    </el-form-item>
    <el-form-item label="Max Value" prop="settings.max">
      <el-input-number v-model="settings.max" />
    </el-form-item>
  </fragment>
</template>

<script lang="ts">
import { Fragment } from 'vue-fragment';
import { Component, Prop, Vue } from 'vue-property-decorator';

import { NumberFieldSettings } from '../types';
import { DockiteFieldNumber } from '..';

@Component({
  name: 'NumberFieldSettingsComponent',
  components: {
    Fragment,
  },
})
export default class NumberFieldSettingsComponent extends Vue {
  @Prop({ required: true })
  readonly value!: NumberFieldSettings;

  @Prop({ required: true })
  readonly rules!: object;

  get settings(): NumberFieldSettings {
    return this.value;
  }

  set settings(value) {
    this.$emit('input', value);
  }

  mounted() {
    if (Object.keys(this.settings).length === 0) {
      this.settings = {
        ...DockiteFieldNumber.defaultOptions,
      };
    }
  }
}
</script>

<style></style>
