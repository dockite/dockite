<template>
  <fragment>
    <el-form-item label="Required">
      <el-switch v-model="settings.required" />
    </el-form-item>
  </fragment>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Fragment } from 'vue-fragment';
import { Schema } from '@dockite/types';

interface Settings {
  required: boolean;
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
