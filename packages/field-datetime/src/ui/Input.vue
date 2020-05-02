<template>
  <a-form-model-item
    :label="fieldConfig.title"
    :colon="true"
    :prop="fieldConfig.name"
  >
    <a-date-picker
      v-model="fieldData"
      :show-time="!settings.date"
    />
  </a-form-model-item>
</template>

<script>
import moment from 'moment';

export default {
  name: 'DatetimeField',

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
        if (this.value !== null && !moment.isMoment(this.value)) {
          return moment(this.value);
        }

        if (moment.isMoment(this.value)) {
          return this.value;
        }

        return null;
      },
      set(value) {
        if (moment.isMoment(value)) {
          this.$emit('input', value.toDate());
        } else {
          this.$emit('input', value);
        }
      },
    },

    settings() {
      return this.fieldConfig.settings;
    },
  },

  mounted() {
    if (this.value === null) {
      this.$emit('input', null);
    }

    const rules = [];

    if (this.fieldConfig.settings.required) rules.push(this.getRequiredRule());
    if (!this.fieldConfig.settings.date) rules.push(this.getDateTimeRule());
    if (this.fieldConfig.settings.date) rules.push(this.getDateRule());

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

    getDateTimeRule() {
      return {
        validator(_rule, value, callback) {
          if (!moment(value).isValid()) {
            callback(false);
          }

          callback();
        },
        message: `${this.fieldConfig.title} must be a valid datetime`,
        trigger: 'change',
      };
    },

    getDateRule() {
      return {
        validator(_rule, value, callback) {
          if (!moment(value).isValid()) {
            callback(false);
          }

          callback();
        },
        message: `${this.fieldConfig.title} must be a valid YYYY-MM-DD date.`,
        trigger: 'change',
      };
    },
  },
};
</script>

<style></style>
