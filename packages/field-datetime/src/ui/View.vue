<template>
  <div>
    <span v-if="date">
      {{ format(date, 'Pp') }}
    </span>
    <i v-else>
      N/A
    </i>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { format } from 'date-fns';

import { DockiteFieldDateTimeEntity } from '../types';

@Component({
  name: 'DateTimeFieldViewComponent',
})
export default class DateTimeFieldViewComponent extends Vue {
  @Prop({ required: true })
  readonly data!: string | null;

  @Prop({ required: true, type: Object })
  readonly field!: DockiteFieldDateTimeEntity;

  public format = format;

  get date(): Date | null {
    if (this.data) {
      return new Date(this.data);
    }

    return null;
  }
}
</script>

<style></style>
