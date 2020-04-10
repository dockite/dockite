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
      validator: (value) => typeof value === 'date' || typeof value === 'string' || value === null,
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
          return moment(this.value);
        }

        return null;
      },
      set(value) {
        if (moment.isMoment(value)) {
          this.$emit('input', moment(value).format('YYYY-MM-DD'));
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
        type: 'date',
        message: `${this.fieldConfig.title} must be a valid datetime`,
        trigger: 'change',
      };
    },

    getDateRule() {
      return {
        validator(_rule, value, callback) {
          if (typeof value === 'string' && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            callback(false);
          }

          if (moment.isMoment(value) && !moment(value).isValid()) {
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
