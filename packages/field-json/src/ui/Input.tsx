import { DockiteFieldInputComponentProps } from '@dockite/types';
import CodeMirror from 'codemirror';
import jsonlint from 'jsonlint-mod';
import { computed, defineComponent, onMounted, onUnmounted, PropType, ref, toRefs } from 'vue';

import { DockiteFieldJSONEntity } from '../types';

import 'codemirror/addon/dialog/dialog';
import 'codemirror/addon/display/autorefresh';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/lint/json-lint';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/search/search';
import 'codemirror/mode/javascript/javascript';

import 'codemirror/lib/codemirror.css';

import 'codemirror/theme/nord.css';
import 'codemirror/addon/dialog/dialog.css';
import 'codemirror/addon/lint/lint.css';

import './Input.scss';

export type InputComponentProps = DockiteFieldInputComponentProps<string, DockiteFieldJSONEntity>;

export const InputComponent = defineComponent({
  name: 'DockiteFieldJSONInput',
  props: {
    name: {
      type: String as PropType<InputComponentProps['name']>,
      required: true,
    },

    modelValue: {
      type: (null as any) as PropType<InputComponentProps['value']>,
      required: true,
    },

    formData: {
      type: Object as PropType<InputComponentProps['formData']>,
      required: true,
    },

    fieldConfig: {
      type: Object as PropType<InputComponentProps['fieldConfig']>,
      required: true,
    },

    errors: {
      type: Object as PropType<InputComponentProps['errors']>,
      required: true,
    },
  },

  setup: (props, ctx) => {
    const { errors, fieldConfig, modelValue, name } = toRefs(props);

    const rules = ref<Array<Record<string, any>>>([
      {
        message: `${fieldConfig.value.title} must be valid JSON`,
        trigger: 'blur',
        validator(_rule: never, value: string | null, callback: any) {
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
      },
    ]);

    const editor = ref<CodeMirror.Editor | null>(null);

    const textarea = ref<HTMLTextAreaElement | null>(null);

    const fieldData = computed({
      get: () => modelValue.value || '',
      set: newValue => ctx.emit('update:modelValue', newValue),
    });

    if (!fieldData.value) {
      fieldData.value = '';
    }

    const formatDocument = (): void => {
      if (editor.value && fieldData.value) {
        try {
          const content = JSON.stringify(JSON.parse(fieldData.value), null, 2);

          editor.value.setValue(content);
        } catch (_) {
          // no-op
        }
      }
    };

    if (fieldConfig.value.settings.required) {
      rules.value.push({
        required: true,
        message: `${fieldConfig.value.title} is required`,
        trigger: 'blur',
      });
    }

    onMounted(() => {
      const w = window as any;

      if (!w.jsonlint) {
        w.jsonlint = jsonlint;
      }

      if (!editor.value && textarea.value) {
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
            'Shift-Alt-F': formatDocument,
          },
        });

        editor.value.on('change', instance => {
          if (!fieldData.value) {
            return;
          }

          fieldData.value = instance.getValue();
        });

        // Handles the syncing of blur between CodeMirror and the underlying textarea
        // so that async validator rules may be triggered
        editor.value.on('blur', () => {
          if (textarea.value) {
            textarea.value.focus();
            textarea.value.blur();
          }
        });
      }
    });

    onUnmounted(() => {
      const w = window as any;

      if ('jsonlint' in w) {
        delete w.jsonlint;
      }
    });

    return (): JSX.Element => {
      return (
        <el-form-item
          label={fieldConfig.value.title}
          prop={name.value}
          rules={rules.value}
          class="dockite-field-json"
        >
          <div class="shadow flex flex-col" style={{ minHeight: '60vh', maxHeight: '800px' }}>
            <textarea ref={textarea} />
          </div>

          {errors.value[name.value] && (
            <div class="el-form-item__error">{errors.value[name.value]}</div>
          )}

          <div class="el-form-item__description">{fieldConfig.value.description}</div>
        </el-form-item>
      );
    };
  },
});

export default InputComponent;
