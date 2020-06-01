<template>
  <fragment>
    <el-form-item label="Required">
      <el-switch v-model="settings.required" />
    </el-form-item>
    <el-form-item label="URL Safe">
      <el-switch v-model="settings.urlSafe" />
    </el-form-item>
    <el-form-item label="Textarea">
      <el-switch v-model="settings.textarea" />
    </el-form-item>
    <el-form-item label="Min Length">
      <el-input-number
        v-model="settings.minLen"
        :min="0"
      />
    </el-form-item>
    <el-form-item label="Max Length">
      <el-input-number
        v-model="settings.maxLen"
        :min="0"
      />
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
        maxLen: null,
        minLen: null,
        textarea: false,
        required: false,
        urlSafe: false,
      };
    }
  },
};
</script>

<style></style>
