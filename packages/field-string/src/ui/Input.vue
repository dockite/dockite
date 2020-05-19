<template>
  <el-form-item
    :label="fieldConfig.title"
    :colon="true"
    :prop="fieldConfig.name"
  >
    <el-input
      v-if="!fieldConfig.settings.textarea"
      v-model="fieldData"
      size="large"
    />
    <el-textarea
      v-if="fieldConfig.settings.textarea"
      v-model="fieldData"
      size="large"
      :auto-size="{ minRows: 3, maxRows: 5 }"
      :allow-clear="true"
    />
    <p slot="extra">
      {{ fieldConfig.description }}
    </p>
  </el-form-item>
</template>

<script>
import isURL from 'validator/es/lib/isURL';

export default {
  name: 'StringField',

  props: {
    name: {
      type: String,
      required: true,
    },
    value: {
      validator: (value) => typeof value === 'string' || value === null,
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

    const rules = [];

    if (this.fieldConfig.settings.required) rules.push(this.getRequiredRule());
    if (this.fieldConfig.settings.urlSafe) rules.push(this.getUrlSafeRule());
    if (this.fieldConfig.settings.minLen) rules.push(this.getMinRule());
    if (this.fieldConfig.settings.maxLen) rules.push(this.getMaxRule());

    this.$emit('update:rules', { [this.fieldConfig.name]: rules });
  },

  methods: {
    getUrlSafeRule() {
      return {
        validator(_rule, value, callback) {
          if (!isURL(value)) {
            return callback(false);
          }

          return callback();
        },
        message: `${this.fieldConfig.title} must be URL Safe`,
        trigger: 'change',
      };
    },

    getRequiredRule() {
      return {
        required: true,
        message: `${this.fieldConfig.title} is required`,
        trigger: 'change',
      };
    },

    getMinRule() {
      return {
        min: Number(this.fieldConfig.settings.minLen),
        message: `${this.fieldConfig.title} must contain atleast ${this.fieldConfig.settings.minLen} characters.`,
        trigger: 'change',
      };
    },

    getMaxRule() {
      return {
        max: Number(this.fieldConfig.settings.maxLen),
        message: `${this.fieldConfig.title} must contain no more than ${this.fieldConfig.settings.maxLen} characters.`,
        trigger: 'change',
      };
    },
  },
};
</script>

<style></style>
