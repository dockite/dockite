<template>
  <a-form-item :label="fieldConfig.title" :colon="true">
    <a-input v-model="fieldData" size="large" />
    <p slot="extra">
      {{ fieldConfig.description }}
    </p>
  </a-form-item>
</template>

<script>
export default {
  name: 'StringField',

  props: {
    value: {
      type: String,
      required: true,
    },
    formData: {
      type: Object,
      required: true,
    },
    fieldConfig: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {};
  },

  computed: {
    fieldData: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },
  },
};
</script>

<style></style>
