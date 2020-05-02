<template>
  <a-form-model-item ref="field" :label="fieldConfig.title" :colon="true" :prop="fieldConfig.name">
    <code-mirror
      ref="codemirror"
      v-model="fieldData.content"
      :options="codeMirrorOptions"
      @blur="
        () => {
          $refs.field.onFieldBlur();
        }
      "
      @input="
        () => {
          $refs.field.onFieldChange();
        }
      "
    />
    <div class="dockite-field code language-selector">
      <span style="padding-right: 1rem;">Language:</span>
      <a-select
        show-search
        style="max-width: 250px;"
        v-model="fieldData.language"
        :filter-option="filterSelect"
      >
        <a-select-option v-for="lang in Object.keys(mimeMap)" :key="lang">
          {{ lang }}
        </a-select-option>
      </a-select>
    </div>
    <p slot="extra">
      {{ fieldConfig.description }}
    </p>
  </a-form-model-item>
</template>

<script>
import { codemirror as CodeMirror } from 'vue-codemirror';

import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/monokai.css';

import 'codemirror-graphql/mode';
import 'codemirror/mode/javascript/javascript';

import { includes, mimeMap } from './consts';

export default {
  name: 'CodeField',

  components: {
    CodeMirror,
  },

  props: {
    name: {
      type: String,
      required: true,
    },
    value: {
      validator: (value) => {
        if (value === null) {
          return true;
        }

        return typeof value === 'object' &&
          Object.keys(value).filter(key => ['language', 'content'].includes(key)).length >= 2
      },
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
      mimeMap,
      includes,
      modeManager: ['javascript', 'graphql'],
    };
  },

  computed: {
    codeMirrorOptions() {
      return {
        tabSize: 2,
        styleActiveLine: true,
        lineNumbers: true,
        lineWrapping: false,
        line: true,
        mode: this.mimeMap[this.fieldData.language],
        theme: 'monokai',
      };
    },

    fieldData: {
      get() {
        if (this.value === null) {
          return { language: 'Javascript', content: '' };
        }

        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },
  },

  watch: {
    currentMode() {
      this.fieldData.language = this.currentMode;
    },
  },

  mounted() {
    if (this.value === null) {
      this.$emit('input', {
        language: 'Javascript',
        content: '',
      });
    }

    const rules = [];

    if (this.fieldConfig.settings.required) rules.push(this.getRequiredRule());

    this.$emit('update:rules', { [this.fieldConfig.name]: rules });

    this.includes.forEach(include => {
      if (!this.modeManager.includes(include)) {
        const path = `${include}/${include}.js`;
        import(/* webpackMode: "eager" */ `codemirror/mode/` + path).then(() => {
          this.modeManager.push(include);
        });
      }
    });
  },

  methods: {
    getRequiredRule() {
      return {
        required: true,
        message: `${this.fieldConfig.title} is required`,
        trigger: 'change',
      };
    },

    filterSelect(input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      );
    },
  },
};
</script>

<style lang="scss">
.dockite-field.code {
  &.language-selector {
    display: flex;
    align-items: center;
    justify-content: flex-end;

    padding-top: 0.5rem;
  }
}
</style>
