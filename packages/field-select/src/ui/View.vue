<template>
  <div>
    <span v-if="data">
      {{ label }}
    </span>
    <i v-else>
      N/A
    </i>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { DockiteFieldSelectEntity } from '../types';

@Component({
  name: 'SelectFieldViewComponent',
})
export default class SelectFieldViewComponent extends Vue {
  @Prop({ required: true })
  readonly data!: string | null;

  @Prop({ required: true, type: Object })
  readonly field!: DockiteFieldSelectEntity;

  get label(): string {
    const item = this.field.settings.options.find(x => x.value === this.data);

    if (item) {
      return item.label;
    }

    return this.data || '';
  }
}
</script>

<style></style>
