import { startCase } from 'lodash';
import { computed, defineComponent, PropType, ref, watch } from 'vue';

import { SchemaType } from '@dockite/types';

import { nameStepFormRules } from './formRules';
import { StepComponentProps } from './types';

import { RenderIfComponent } from '~/components/Common/RenderIf';

export const SchemaCreateNameStepComponent = defineComponent({
  name: 'SchemaCreateNameStepComponent',

  props: {
    modelValue: {
      type: Object as PropType<StepComponentProps['modelValue']>,
    },

    updating: {
      type: Boolean as PropType<StepComponentProps['updating']>,
      default: false,
    },
  },

  setup: (props, ctx) => {
    const modelValue = computed({
      get: () => props.modelValue as StepComponentProps['modelValue'],
      set: value => ctx.emit('update:modelValue', value),
    });

    const form = ref<any | null>(null);

    const schemaNameFrozen = ref(true);

    const schemaType = computed(() =>
      modelValue.value.type === SchemaType.DEFAULT ? 'Schema' : 'Singleton',
    );

    const handleSchemaNameBlur = (): void => {
      schemaNameFrozen.value = true;
    };

    const handleOverrideSchemaName = (): void => {
      schemaNameFrozen.value = false;
    };

    const handleProgressStep = (): void => {
      if (form.value) {
        form.value.validate().then(() => {
          ctx.emit('progress:nextStep');
        });
      }
    };

    watch(
      () => modelValue.value.title,
      value => {
        if (schemaNameFrozen.value) {
          modelValue.value.name = startCase(value).replace(/\s/g, '');
        }
      },
    );

    return () => {
      return (
        <div>
          <RenderIfComponent condition={!props.updating}>
            <h3 class="text-xl font-semibold pb-3">
              First, lets give the {schemaType.value} a name!
            </h3>

            {modelValue.value.type === SchemaType.DEFAULT && (
              <blockquote class="border-l-4 rounded text-sm p-3 bg-gray-200 mb-5">
                The Schema name should be reflective of the type of content that it will hold.
                <span class="block pb-2" />
                An example of a good Schema name would be <u>BlogPosts</u> for a Schema designed to
                contain all of the blog posts for a particular backend.
              </blockquote>
            )}

            {modelValue.value.type === SchemaType.SINGLETON && (
              <blockquote class="border-l-4 rounded text-sm p-3 bg-gray-200 mb-5">
                The Singleton name should be reflective of the type of content that it will hold.
                <span class="block pb-2" />
                An example of a good Singleton name would be <u>Settings</u> for a Singleton which
                is responsible for the management of settings for a particular backend.
              </blockquote>
            )}
          </RenderIfComponent>

          <el-form
            ref={form}
            model={modelValue.value}
            rules={nameStepFormRules}
            labelPosition="top"
          >
            <el-form-item label="Title" prop="title">
              <el-input v-model={modelValue.value.title} />

              <div class="el-form-item__description">
                The cosmetic title that should be displayed for the {schemaType.value}.
              </div>
            </el-form-item>

            <el-form-item label="Name" prop="name">
              <el-input
                v-model={modelValue.value.name}
                disabled={schemaNameFrozen.value}
                onBlur={() => handleSchemaNameBlur()}
              />

              <div class="relative">
                <div class="el-form-item__description">
                  The API identifier for the {schemaType.value}.
                </div>

                <div class="absolute top-0 right-0">
                  <el-button type="text" size="mini" onClick={() => handleOverrideSchemaName()}>
                    Override {schemaType.value} Name?
                  </el-button>
                </div>
              </div>
            </el-form-item>

            <el-form-item>
              <div class="flex justify-between items-center pt-5">
                <span />

                <el-button type="primary" onClick={() => handleProgressStep()}>
                  Next Step
                </el-button>
              </div>
            </el-form-item>
          </el-form>
        </div>
      );
    };
  },
});

export default SchemaCreateNameStepComponent;
