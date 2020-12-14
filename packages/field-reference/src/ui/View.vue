<template>
  <div>
    <span v-if="data">
      {{ data.identifier || data.id }}
    </span>
    <i v-else>
      N/A
    </i>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Field } from '@dockite/database';

import { ReferenceFieldValue } from '../types';

@Component({
  name: 'ReferenceFieldViewComponent',
})
export default class ReferenceFieldViewComponent extends Vue {
  @Prop({ required: true })
  readonly data!: ReferenceFieldValue | null;

  @Prop({ required: true, type: Object })
  readonly field!: Field;
}
</script>

<style></style>
