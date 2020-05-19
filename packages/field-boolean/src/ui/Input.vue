<template>
  <el-form-item
    :label="fieldConfig.title"
    :colon="true"
    :prop="fieldConfig.name"
  >
    <el-switch
      v-model="fieldData"
      size="large"
    />
    <p slot="extra">
      {{ fieldConfig.description }}
    </p>
  </el-form-item>
</template>

<script>
export default {
  name: 'BooleanField',

  props: {
    name: {
      type: String,
      required: true,
    },
    value: {
      validator: (value) => typeof value === 'boolean' || value === null,
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

        return false;
      },
      set(value) {
        this.$emit('input', value);
      },
    },
  },

  mounted() {
    if (this.value === null) {
      this.$emit('input', false);
    }

    const rules = [];

    if (this.fieldConfig.settings.required) rules.push(this.getRequiredRule());

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
  },
};
</script>

<style></style>
