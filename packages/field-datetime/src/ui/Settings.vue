<template>
  <fragment>
    <el-form-item label="Required">
      <el-switch v-model="settings.required" />
    </el-form-item>
    <el-form-item label="Date only">
      <el-switch v-model="settings.date" />
    </el-form-item>
    <el-form-item label="Time only">
      <el-switch v-model="settings.time" />
    </el-form-item>
  </fragment>
</template>

<script lang="ts">
import { Fragment } from 'vue-fragment';
import { Component, Prop, Vue } from 'vue-property-decorator';

import { DateFieldSettings } from '../types';
import { DockiteFieldDatetime } from '..';

@Component({
  name: '',
  components: {
    Fragment,
  },
})
export default class DateTimeFieldSettingsComponent extends Vue {
  @Prop({ required: true })
  readonly value!: DateFieldSettings;

  @Prop({ required: true })
  readonly rules!: Record<string, any>;

  get settings(): DateFieldSettings {
    return this.value;
  }

  set settings(value) {
    this.$emit('input', value);
  }

  mounted() {
    if (Object.keys(this.settings).length === 0) {
      this.settings = {
        ...DockiteFieldDatetime.defaultOptions,
      };
    }
  }
}
</script>

<style></style>
