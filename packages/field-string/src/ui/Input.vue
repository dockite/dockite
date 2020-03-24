<template>
  <a-input :defaultValue="fieldData" size="large" />
</template>

<script>
import Vue from 'vue';

import Input from 'ant-design-vue/lib/input';
import 'ant-design-vue/lib/input/css';

Vue.use(Input);

export default {
  name: 'StringField',
  props: {
    fieldData: {
      required: true,
    }
  },
  data() {
    return {};
  },
  computed: {
    nice() {
      return 'nice'
    }
  }
};
</script>

<style></style>
