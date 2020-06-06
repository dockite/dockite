<template>
  <el-form-item
    class="dockite-field-json"
    :label="fieldConfig.title"
    :prop="name"
    :rules="rules"
  >
    <code-mirror
      v-model="fieldData"
      :options="codeMirrorOptions"
    />
    <div
      slot="error"
      slot-scope="{ error }"
      class="el-form-item__error"
    >
      {{ error }}
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

import 'codemirror/mode/javascript/javascript';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/nord.css';

@Component({
  name: 'JSONFieldInputComponent',
  components: {
    CodeMirror,
  },
})
export default class JSONFieldInputComponent extends Vue {
  @Prop({ required: true })
  readonly name!: string;

  @Prop({ required: true })
  readonly value!: string | null;

  @Prop({ required: true })
  readonly formData!: object;

  @Prop({ required: true })
  readonly fieldConfig!: Field;

  public rules: object[] = [];

  public codeMirrorOptions: object = {
    line: true,
    lineNumbers: true,
    lineWrapping: false,
    mode: 'application/json',
    styleActiveLine: true,
    tabSize: 2,
    theme: 'nord',
  };

  get fieldData(): string {
    if (this.value === null) {
      return '';
    }

    if (typeof this.value === 'object') {
      return JSON.stringify(this.value, null, 2);
    }

    return this.value;
  }

  set fieldData(value) {
    this.$emit('input', value);
  }

  beforeMount(): void {
    if (this.value === null) {
      this.$emit('input', '');
    }

    this.rules.push(this.getJSONRule());

    if (this.fieldConfig.settings.required) {
      this.rules.push(this.getRequiredRule());
    }
  }

  public getRequiredRule(): object {
    return {
      required: true,
      message: `${this.fieldConfig.title} is required`,
      trigger: 'blur',
    };
  }

  public getJSONRule(): object {
    return {
      validator(_rule: never, value: string | null, callback: Function) {
        if (value === null || value.length === 0) {
          return callback();
        }

        try {
          JSON.parse(value);

          return callback();
        } catch (err) {
          return callback(err);
        }
      },
      message: `${this.fieldConfig.title} must be valid JSON`,
      trigger: 'blur',
    };
  }
}
</script>

<style lang="scss">
.dockite-field-json {
  .CodeMirror {
    line-height: normal;
    padding: 0.5rem 0;
    margin-bottom: 0.25rem;
  }
}
</style>
