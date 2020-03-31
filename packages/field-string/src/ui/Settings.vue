<template>
  <fragment>
    <a-form-model-item label="Required">
      <a-switch v-model="settings.required" />
    </a-form-model-item>
    <a-form-model-item label="URL Safe">
      <a-switch v-model="settings.urlSafe" />
    </a-form-model-item>
    <a-form-model-item label="Min Length">
      <a-input-number :min="0" v-model="settings.minLen" />
    </a-form-model-item>
    <a-form-model-item label="Max Length">
      <a-input-number :min="0" v-model="settings.maxLen" />
    </a-form-model-item>
  </fragment>
</template>

<script>
import { Fragment } from 'vue-fragment';

export default {
  components: {
    Fragment,
  },

  props: {
    value: {
      type: Object,
      required: true,
    },
  },

  computed: {
    settings: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },
  },

  mounted() {
    this.settings = {
      maxLen: null,
      minLen: null,
      required: false,
      urlSafe: false,
    };
  },
};
</script>

<style></style>
