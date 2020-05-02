<template>
  <div class="settings">
    <router-view />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component
export class HomePage extends Vue {}

export default HomePage;
</script>
