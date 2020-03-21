<template>
  <main class="base-router-view" :class="{ 'offset-router-view': pullRight }">
    <router-view />
  </main>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export class BaseRouterView extends Vue {
  @Prop({ type: Boolean, default: () => false })
  readonly pullRight!: boolean;
}

export default BaseRouterView;
</script>

<style lang="scss" scoped>
.offset-router-view {
  margin-right: 15rem;
}
</style>
