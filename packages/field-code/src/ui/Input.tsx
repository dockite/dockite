import { DockiteFieldInputComponentProps } from '@dockite/types';
import CodeMirror from 'codemirror';
import { computed, defineComponent, onMounted, PropType, ref, toRefs } from 'vue';

import { DockiteFieldCodeEntity } from '../types';

import { MIME_MAP } from './consts';

import './Input.scss';

import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/nord.css';

import 'codemirror-graphql/mode';

import 'codemirror/mode/brainfuck/brainfuck';
import 'codemirror/mode/clojure/clojure';
import 'codemirror/mode/cmake/cmake';
import 'codemirror/mode/cobol/cobol';
import 'codemirror/mode/coffeescript/coffeescript';
import 'codemirror/mode/commonlisp/commonlisp';
import 'codemirror/mode/crystal/crystal';
import 'codemirror/mode/css/css';
import 'codemirror/mode/d/d';
import 'codemirror/mode/dart/dart';
import 'codemirror/mode/diff/diff';
import 'codemirror/mode/django/django';
import 'codemirror/mode/dockerfile/dockerfile';
import 'codemirror/mode/elm/elm';
import 'codemirror/mode/erlang/erlang';
import 'codemirror/mode/fortran/fortran';
import 'codemirror/mode/go/go';
import 'codemirror/mode/groovy/groovy';
import 'codemirror/mode/haskell/haskell';
import 'codemirror/mode/haxe/haxe';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/http/http';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/jinja2/jinja2';
import 'codemirror/mode/jsx/jsx';
import 'codemirror/mode/julia/julia';
import 'codemirror/mode/lua/lua';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/mode/mathematica/mathematica';
import 'codemirror/mode/nginx/nginx';
import 'codemirror/mode/pascal/pascal';
import 'codemirror/mode/perl/perl';
import 'codemirror/mode/php/php';
import 'codemirror/mode/powershell/powershell';
import 'codemirror/mode/properties/properties';
import 'codemirror/mode/protobuf/protobuf';
import 'codemirror/mode/pug/pug';
import 'codemirror/mode/puppet/puppet';
import 'codemirror/mode/python/python';
import 'codemirror/mode/r/r';
import 'codemirror/mode/rst/rst';
import 'codemirror/mode/ruby/ruby';
import 'codemirror/mode/rust/rust';
import 'codemirror/mode/sass/sass';
import 'codemirror/mode/scheme/scheme';
import 'codemirror/mode/shell/shell';
import 'codemirror/mode/smalltalk/smalltalk';
import 'codemirror/mode/smarty/smarty';
import 'codemirror/mode/solr/solr';
import 'codemirror/mode/sparql/sparql';
import 'codemirror/mode/spreadsheet/spreadsheet';
import 'codemirror/mode/sql/sql';
import 'codemirror/mode/stylus/stylus';
import 'codemirror/mode/swift/swift';
import 'codemirror/mode/toml/toml';
import 'codemirror/mode/twig/twig';
import 'codemirror/mode/vb/vb';
import 'codemirror/mode/vbscript/vbscript';
import 'codemirror/mode/vue/vue';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/yaml-frontmatter/yaml-frontmatter';
import 'codemirror/mode/yaml/yaml';

interface FieldDataValue {
  language: keyof typeof MIME_MAP;
  content: string;
}

export type InputComponentProps = DockiteFieldInputComponentProps<
  FieldDataValue,
  DockiteFieldCodeEntity
>;

export const InputComponent = defineComponent({
  name: 'DockiteFieldCodeInput',
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

    const rules = ref<Array<Record<string, any>>>([]);

    const textarea = ref<any>(null);

    const fieldData = computed({
      get: () => modelValue.value,
      set: newValue => ctx.emit('update:modelValue', newValue),
    });

    if (!fieldData.value) {
      Object.assign(fieldData.value, {
        language: 'Javascript',
        content: '',
      });
    }

    if (fieldConfig.value.settings.required) {
      rules.value.push({
        required: true,
        message: `${fieldConfig.value.title} is required`,
        trigger: 'blur',
      });
    }

    onMounted(() => {
      if (!fieldData.value) {
        fieldData.value = { content: '', language: 'JSON' };
      }

      const editor = CodeMirror.fromTextArea(textarea.value, {
        value: fieldData.value.content,
        lineNumbers: true,
        lineWrapping: false,
        mode: MIME_MAP[fieldData.value.language],
        tabSize: 2,
        theme: 'nord',
      });

      editor.on('change', instance => {
        if (!fieldData.value) {
          return;
        }

        fieldData.value.content = instance.getValue();
      });
    });

    return (): JSX.Element => {
      if (!fieldData.value) {
        return <div>Field has not been assigned a value yet.</div>;
      }

      return (
        <el-form-item
          label={fieldConfig.value.title}
          prop={name.value}
          rules={rules.value}
          class={`dockite-field-code ${errors.value[name.value] ? 'is-error' : ''}`}
        >
          <div class="w-full">
            <textarea ref={textarea} />
          </div>

          <div class="flex justify-between items-center">
            <span />

            <el-select v-model={fieldData.value.language}>
              {Object.keys(MIME_MAP).map(key => (
                <el-option label={key} value={key} />
              ))}
            </el-select>
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
