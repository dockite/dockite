<template>
  <div class="home">
    <portal to="title">
      Settings - Home
    </portal>
    hullo
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component
export class HomePage extends Vue {}

export default HomePage;
</script>
