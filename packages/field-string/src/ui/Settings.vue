<template>
  <fragment>
    <a-form-model-item label="Required">
      <a-switch v-model="settings.required" />
    </a-form-model-item>
    <a-form-model-item label="URL Safe">
      <a-switch v-model="settings.urlSafe" />
    </a-form-model-item>
    <a-form-model-item label="Textarea">
      <a-switch v-model="settings.textarea" />
    </a-form-model-item>
    <a-form-model-item label="Min Length">
      <a-input-number
        v-model="settings.minLen"
        :min="0"
      />
    </a-form-model-item>
    <a-form-model-item label="Max Length">
      <a-input-number
        v-model="settings.maxLen"
        :min="0"
      />
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
      maxLen: null,
      minLen: null,
      textarea: false,
      required: false,
      urlSafe: false,
    };
  },
};
</script>

<style></style>
