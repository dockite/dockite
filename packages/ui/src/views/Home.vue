<template>
  <div class="home">
    <div v-if="!true" class="w-1/2">
      Hullo
    </div>
    <div v-else>
      Not hullo
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component
export class HomePage extends Vue {}

export default HomePage;
</script>
