<template>
  <nuxt />
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';

@Component({
  middleware: 'guest',
})
export default class AuthLayout extends Vue {}
</script>

<style lang="scss"></style>
