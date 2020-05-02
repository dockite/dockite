<template>
  <a-form-model-item
    ref="field"
    :label="fieldConfig.title"
    :colon="true"
    :prop="fieldConfig.name"
  >
    <code-mirror
      v-model="fieldData"
      :options="codeMirrorOptions"
      @blur="() => { $refs.field.onFieldBlur() }"
      @input="() => { $refs.field.onFieldChange() }"
    />
    <p slot="extra">
      {{ fieldConfig.description }}
    </p>
  </a-form-model-item>
</template>

<script>
import { codemirror as CodeMirror } from 'vue-codemirror';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/monokai.css';

export default {
  name: 'JSONField',

  components: {
    CodeMirror,
  },

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
    return {
      codeMirrorOptions: {
        tabSize: 2,
        styleActiveLine: true,
        lineNumbers: true,
        lineWrapping: false,
        line: true,
        mode: 'application/json',
        theme: 'monokai',
      },
    };
  },

  computed: {
    fieldData: {
      get() {
        if (this.value === null) {
          return '';
        }

        if (typeof this.value === 'object') {
          return JSON.stringify(this.value, null, 2);
        }

        return this.value;
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

    const rules = [this.getJSONRule()];

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

    getJSONRule() {
      return {
        validator(_rule, value, callback) {
          if (value.length === 0) {
            callback();
            return;
          }

          try {
            JSON.parse(value);

            callback();
          } catch (err) {
            callback(false);
          }
        },
        message: `${this.fieldConfig.title} must be valid JSON`,
        trigger: 'change',
      };
    },
  },
};
</script>

<style lang="scss">

</style>
