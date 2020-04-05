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
      validator: value => typeof value === 'string' || value === null,
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
        if (this.value !== null) {
          return this.value;
        }

        return '';
      },
      set(value) {
        this.$emit('input', value);
      },
    },
  },

  mounted() {
    if (this.value === null) {
      this.$emit('input', '');
    }
  },
};
</script>

<style></style>
