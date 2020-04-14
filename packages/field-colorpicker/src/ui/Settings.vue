<template>
  <a-form-model-item label="Required">
    <a-switch v-model="settings.required" />
  </a-form-model-item>
</template>

<script>
export default {
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
    };
  },
};
</script>

<style></style>
