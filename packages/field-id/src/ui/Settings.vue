<template>
  <fragment>
    <el-form-item label="Required">
      <el-switch v-model="settings.required" />

      <div class="el-form-item__description">
        Controls whether or not the field is required, if set to true the document will not be able
        to be saved without setting the field.
      </div>
    </el-form-item>

    <el-form-item label="ID Type">
      <el-select v-model="settings.type">
        <el-option v-for="type in availableTypes" :key="type" :value="type" :label="type" />
      </el-select>

      <div class="el-form-item__description">
        Controls the type of the ID field.
      </div>
    </el-form-item>
  </fragment>
</template>

<script lang="ts">
import { Fragment } from 'vue-fragment';
import { Component, Prop, Vue } from 'vue-property-decorator';

import { IDFieldSettings, AvailableTypes } from '../types';
import { DockiteFieldID } from '..';

@Component({
  name: 'IDFieldSettingsComponent',
  components: {
    Fragment,
  },
})
export default class IDFieldSettingsComponent extends Vue {
  @Prop({ required: true })
  readonly value!: IDFieldSettings;

  @Prop({ required: true })
  readonly rules!: object;

  get settings(): IDFieldSettings {
    return this.value;
  }

  set settings(value: IDFieldSettings) {
    this.$emit('input', value);
  }

  public availableTypes = AvailableTypes;

  beforeMount() {
    if (Object.keys(this.settings).length === 0) {
      this.settings = { ...DockiteFieldID.defaultOptions };
    }
  }
}
</script>

<style></style>
