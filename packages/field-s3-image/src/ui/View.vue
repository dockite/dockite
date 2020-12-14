<template>
  <div>
    <template v-if="data && Array.isArray(data) && data.length > 0">
      <img :src="data[0].url" :alt="data[0].alt" class="w-full mx-auto" style="max-width: 75px;" />
    </template>

    <template v-else-if="data && !Array.isArray(data)">
      <img :src="data.url" :alt="data.alt" class="w-full mx-auto" style="max-width: 75px;" />
    </template>

    <i v-else class="el-icon-picture-outline font-xl" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Field } from '@dockite/database';

import { S3ImageType, MultipleS3ImageType } from '../types';

@Component({
  name: 'S3ImageFieldViewComponent',
})
export default class S3ImageFieldViewComponent extends Vue {
  @Prop({ required: true })
  readonly data!: S3ImageType | MultipleS3ImageType | null;

  @Prop({ required: true, type: Object })
  readonly field!: Field;
}
</script>

<style></style>
