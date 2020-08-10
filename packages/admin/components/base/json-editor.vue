<template>
  <div class="dockite-import--editor">
    <textarea ref="codemirrorTextarea"></textarea>
  </div>
</template>

<script lang="ts">
import CodeMirror from 'codemirror';
import jsonlint from 'jsonlint-mod';
import { Component, Prop, Vue, Watch, Ref } from 'nuxt-property-decorator';

import 'codemirror/theme/nord.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/lint.css';
import 'codemirror/addon/lint/json-lint';
import 'codemirror/addon/display/autorefresh';

@Component
export default class ImportEditorComponent extends Vue {
  @Prop()
  readonly value!: string;

  @Ref()
  readonly codemirrorTextarea!: HTMLTextAreaElement;

  public editor!: CodeMirror.EditorFromTextArea;

  mounted(): void {
    if (!this.editor) {
      (window as any).jsonlint = jsonlint;

      this.editor = CodeMirror.fromTextArea(this.codemirrorTextarea, {
        value: this.value,
        mode: 'application/json',
        gutters: ['CodeMirror-lint-markers'],
        lineNumbers: true,
        lineWrapping: true,
        lint: true,
        tabSize: 2,
        theme: 'nord',
        autoRefresh: true,
      });

      this.editor.setSize('100%', '100%');

      this.editor.on('blur', cm => {
        this.$emit('input', cm.getValue());
      });
    }
  }

  destroyed(): void {
    delete (window as any).jsonlint;
  }

  @Watch('value', { immediate: true })
  handleValueChange(value: string): void {
    if (this.editor) {
      this.editor.setValue(value);

      this.$nextTick(() => {
        this.editor.refresh();
      });
    } else {
      this.$nextTick(() => {
        this.handleValueChange(value);
      });
    }
  }
}
</script>

<style lang="scss">
.dockite-import--editor {
  .CodeMirror {
    box-sizing: border-box;
    line-height: normal;
    padding: 0.5rem 0;
    margin-bottom: 0.25rem;
  }
}
</style>
