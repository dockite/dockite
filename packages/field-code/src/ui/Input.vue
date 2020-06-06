<template>
  <el-form-item
    :label="fieldConfig.title"
    :prop="name"
    :rules="rules"
    class="dockite-field-code"
  >
    <code-mirror
      ref="codemirror"
      v-model="fieldData.content"
      :options="codeMirrorOptions"
    />
    <div class="language-selector">
      <span style="padding-right: 1rem;">Language:</span>
      <el-select
        v-model="fieldData.language"
        filterable
        style="max-width: 250px;"
      >
        <el-option
          v-for="lang in Object.keys(mimeMap)"
          :key="lang"
          :label="lang"
          :value="lang"
        >
          {{ lang }}
        </el-option>
      </el-select>
    </div>
    <div class="el-form-item__description">
      {{ fieldConfig.description }}
    </div>
  </el-form-item>
</template>

<script lang="ts">
import { Field } from '@dockite/types';
import { codemirror as CodeMirror } from 'vue-codemirror';
import { Component, Prop, Vue } from 'vue-property-decorator';

import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/nord.css';

import 'codemirror-graphql/mode';
import 'codemirror/mode/javascript/javascript';

import { includes, mimeMap } from './consts.ts';

export interface CodeFieldPayload {
  language: string;
  content: string;
}

@Component({
  name: 'CodeFieldInputComponent',
  components: {
    CodeMirror,
  },
})
export default class CodeFieldInputComponent extends Vue {
  @Prop({ required: true })
  readonly name!: string;

  @Prop({ required: true })
  readonly value!: CodeFieldPayload | null;

  @Prop({ required: true })
  readonly formData!: object;

  @Prop({ required: true })
  readonly fieldConfig!: Field;

  public rules: object[] = [];

  public mimeMap = mimeMap;

  public includes = includes;

  public modeManager = ['javascript', 'graphql'];

  get codeMirrorOptions(): object {
    return {
      tabSize: 2,
      styleActiveLine: true,
      lineNumbers: true,
      lineWrapping: false,
      line: true,
      mode: this.mimeMap[this.fieldData.language],
      theme: 'nord',
    };
  }

  get fieldData(): CodeFieldPayload {
    if (this.value === null) {
      return { language: 'Javascript', content: '' };
    }

    return this.value;
  }

  set fieldData(value: CodeFieldPayload) {
    this.$emit('input', value);
  }

  beforeMount(): void {
    if (this.value === null) {
      this.$emit('input', {
        language: 'Javascript',
        content: '',
      });
    }


    if (this.fieldConfig.settings.required) {
      this.rules.push(this.getRequiredRule());
    }

    this.includes.forEach((include) => {
      if (!this.modeManager.includes(include)) {
        const path = `${include}/${include}.js`;
        import(/* webpackMode: "eager" */ `codemirror/mode/${path}`).then(() => {
          this.modeManager.push(include);
        });
      }
    });
  }

  getRequiredRule(): object {
    return {
      required: true,
      message: `${this.fieldConfig.title} is required`,
      trigger: 'blur',
    };
  }
}
</script>

<style lang="scss">
.dockite-field-code {
  .language-selector {
    display: flex;
    align-items: center;
    justify-content: flex-end;

    padding-top: 0.5rem;
  }

  .CodeMirror {
    line-height: normal;
    padding: 0.5rem 0;
    margin-bottom: 0.25rem;
  }
}
</style>
