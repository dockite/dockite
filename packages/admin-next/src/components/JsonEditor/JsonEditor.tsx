import CodeMirror from 'codemirror';
import { ElMessage } from 'element-plus';
import jsonlint from 'jsonlint-mod';
import { computed, defineComponent, onMounted, onUnmounted, PropType, ref } from 'vue';

import 'codemirror/mode/javascript/javascript';

import 'codemirror/addon/dialog/dialog';
import 'codemirror/addon/display/autorefresh';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/lint/json-lint';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/search/search';

import 'codemirror/lib/codemirror.css';

import 'codemirror/theme/nord.css';
import 'codemirror/addon/dialog/dialog.css';
import 'codemirror/addon/lint/lint.css';

import './JsonEditor.scss';

export interface JsonEditorComponentProps {
  modelValue: string;
  minHeight: string;
}

export const JsonEditorComponent = defineComponent({
  name: 'JsonEditorComponent',

  props: {
    modelValue: {
      type: String as PropType<JsonEditorComponentProps['modelValue']>,
    },

    minHeight: {
      type: String as PropType<JsonEditorComponentProps['minHeight']>,
      default: '400px',
    },
  },

  setup: (props, ctx) => {
    const modelValue = computed({
      get: () => props.modelValue as JsonEditorComponentProps['modelValue'],
      set: value => ctx.emit('update:modelValue', value),
    });

    const editor = ref<CodeMirror.Editor | null>(null);

    const textarea = ref<HTMLTextAreaElement | null>(null);

    /**
     * Handles the formatting of JSON content within the JsonEditor component.
     *
     * @param cm The codemirror instance
     */
    const handleFormatContent = (cm: CodeMirror.Editor): void => {
      try {
        const content = cm.getValue();

        const parsed = JSON.parse(content);

        cm.setValue(JSON.stringify(parsed, null, 2));
      } catch {
        ElMessage.warning('Unable to format malformed JSON');
      }
    };

    onMounted(() => {
      const w = window as any;

      if (!editor.value && textarea.value) {
        w.jsonlint = jsonlint;

        editor.value = CodeMirror.fromTextArea(textarea.value, {
          mode: 'application/json',
          theme: 'nord',

          autoCloseBrackets: true,
          autoRefresh: true,
          gutters: ['CodeMirror-lint-markers', 'CodeMirror-linenumbers'],
          lineNumbers: true,
          lineWrapping: true,
          lint: true,
          matchBrackets: true,
          tabSize: 2,

          extraKeys: {
            'Shift-Alt-F': handleFormatContent,
          },
        });

        // editor.value.on('blur', cm => {
        //   modelValue.value = cm.getValue();
        // });

        editor.value.on('change', cm => {
          modelValue.value = cm.getValue();
        });
      }
    });

    onUnmounted(() => {
      const w = window as any;

      if ('jsonlint' in w) {
        delete w.jsonlint;
      }
    });

    return () => (
      <div class="dockite-json-editor shadow flex flex-col" style={{ minHeight: props.minHeight }}>
        <textarea ref={textarea}>{modelValue.value}</textarea>
      </div>
    );
  },
});
