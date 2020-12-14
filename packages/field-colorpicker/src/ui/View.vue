<template>
  <div>
    <template v-if="data">
      <span class="px-2 py-1 rounded" :style="{ background: data }">
        {{ data }}
      </span>
    </template>
    <i v-else>
      N/A
    </i>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { DockiteFieldColorPickerEntity } from '../types';

@Component({
  name: 'ColorpickerFieldViewComponent',
})
export default class ColorpickerFieldViewComponent extends Vue {
  @Prop({ required: true })
  readonly data!: string | null;

  @Prop({ required: true, type: Object })
  readonly field!: DockiteFieldColorPickerEntity;
}
</script>

<style></style>
