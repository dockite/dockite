<template>
  <fragment>
    <el-form-item label="Required">
      <el-switch v-model="settings.required" />
    </el-form-item>
    <el-form-item label="Repeatable">
      <el-switch v-model="settings.repeatable" />
    </el-form-item>
    <el-form-item label="Min Rows">
      <el-input-number v-model="settings.minRows" />
    </el-form-item>
    <el-form-item label="Max Rows">
      <el-input-number v-model="settings.maxRows" />
    </el-form-item>
  </fragment>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Fragment } from 'vue-fragment';
import { Schema } from '@dockite/types';

interface Settings {
  required: boolean;
  repeatable: boolean;
  minRows: number;
  maxRows: number;
}

interface SchemaResults {
  results: Schema[];
}

@Component({
  name: 'GroupFieldSettingsComponent',
  components: {
    Fragment,
  },
})
export default class GroupFieldSettingsComponent extends Vue {
  @Prop({ required: true, type: Object })
  readonly value!: any;

  @Prop({ required: true, type: Object })
  readonly rules!: object;

  get settings(): Settings {
    return this.value;
  }

  set settings(value: Settings) {
    this.$emit('input', value);
  }

  get initialSettings() {
    return {
      required: false,
      repeatable: false,
      minRows: 0,
      maxRows: Infinity,
    };
  }

  mounted(): void {
    this.settings = {
      ...this.initialSettings,
      ...this.settings,
    };
  }
}
</script>

<style></style>
