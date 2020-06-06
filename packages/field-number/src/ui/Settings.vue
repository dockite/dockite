<template>
  <fragment>
    <el-form-item
      label="Required"
      prop="settings.required"
    >
      <el-switch v-model="settings.required" />
    </el-form-item>
    <el-form-item
      label="Float"
      prop="settings.float"
    >
      <el-switch v-model="settings.float" />
    </el-form-item>
    <el-form-item
      label="Min Value"
      prop="settings.min"
    >
      <el-input-number v-model="settings.min" />
    </el-form-item>
    <el-form-item
      label="Max Value"
      prop="settings.max"
    >
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
    if (Object.keys(this.settings).length === 0) {
      this.settings = {
        required: false,
        float: false,
        min: -Infinity,
        max: Infinity,
      };
    }
  },
};
</script>

<style></style>
