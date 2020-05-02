<template>
  <fragment>
    <a-form-model-item label="Required">
      <a-switch v-model="settings.required" />
    </a-form-model-item>
    <a-form-model-item label="Date only">
      <a-switch v-model="settings.date" />
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
      date: false,
    };
  },
};
</script>

<style></style>
