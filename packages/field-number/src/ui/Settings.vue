<template>
  <fragment>
    <a-form-model-item label="Required">
      <a-switch v-model="settings.required" />
    </a-form-model-item>
    <a-form-model-item label="Float">
      <a-switch v-model="settings.float" />
    </a-form-model-item>
    <a-form-model-item label="Min Value">
      <a-input-number v-model="settings.min" />
    </a-form-model-item>
    <a-form-model-item label="Max Value">
      <a-input-number v-model="settings.max" />
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

    rules: {
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
      required: false,
      float: false,
      min: null,
      max: null,
    };
  },
};
</script>

<style></style>
