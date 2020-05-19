<template>
  <el-form-item label="Required">
    <el-switch v-model="settings.required" />
  </el-form-item>
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
