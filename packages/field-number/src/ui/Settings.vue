<template>
  <fragment>
    <el-form-item label="Required">
      <el-switch v-model="settings.required" />
    </el-form-item>
    <el-form-item label="Float">
      <el-switch v-model="settings.float" />
    </el-form-item>
    <el-form-item label="Min Value">
      <el-input-number v-model="settings.min" />
    </el-form-item>
    <el-form-item label="Max Value">
      <el-input-number v-model="settings.max" />
    </el-form-item>
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
