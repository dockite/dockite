<template>
  <el-form-item
    :label="fieldConfig.title"
    :colon="true"
    :prop="fieldConfig.name"
  >
    <el-input-number
      v-model="fieldData"
      type="number"
      v-bind="fieldBind"
    />
  </el-form-item>
</template>

<script>
export default {
  name: 'NumberField',

  props: {
    name: {
      type: String,
      required: true,
    },
    value: {
      validator: (value) => typeof value === 'number' || value === null,
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

        return 0;
      },
      set(value) {
        this.$emit('input', value);
      },
    },

    settings() {
      return this.fieldConfig.settings;
    },

    fieldBind() {
      const bind = {};

      if (this.settings.min) {
        bind.min = this.settings.min;
      }

      if (this.settings.max) {
        bind.max = this.settings.max;
      }

      return bind;
    },
  },

  mounted() {
    if (this.value === null) {
      this.$emit('input', false);
    }

    const rules = [];

    if (this.fieldConfig.settings.required) rules.push(this.getRequiredRule());
    if (!this.fieldConfig.settings.float) rules.push(this.getIntRule());
    if (this.fieldConfig.settings.float) rules.push(this.getFloatRule());
    if (this.fieldConfig.settings.min) rules.push(this.getMinRule());
    if (this.fieldConfig.settings.max) rules.push(this.getMaxRule());

    this.$emit('update:rules', { [this.fieldConfig.name]: rules });
  },

  methods: {
    getRequiredRule() {
      return {
        required: true,
        message: `${this.fieldConfig.title} is required`,
        trigger: 'change',
      };
    },

    getIntRule() {
      return {
        type: 'integer',
        message: `${this.fieldConfig.title} must be a whole number`,
        trigger: 'change',
      };
    },

    getFloatRule() {
      return {
        type: 'number',
        message: `${this.fieldConfig.title} must be a floating point number`,
        trigger: 'change',
      };
    },

    getMaxRule() {
      return {
        max: this.fieldConfig.settings.max,
        message: `${this.fieldConfig.title} should be less than ${this.fieldConfig.settings.max}`,
        trigger: 'change',
      };
    },

    getMinRule() {
      return {
        min: this.fieldConfig.settings.min,
        message: `${this.fieldConfig.title} should be greater than ${this.fieldConfig.settings.min}`,
        trigger: 'change',
      };
    },
  },
};
</script>

<style></style>
