import { computed, defineComponent, PropType, ref, watch } from 'vue';

import { SchemaType } from '@dockite/types';

import { SchemaViewConfigurationComponent } from '../../ViewConfiguration';

import { fieldsStepFormRules } from './formRules';
import { StepComponentProps } from './types';

export const SchemaCreateSettingsStepComponent = defineComponent({
  name: 'SchemaCreateSettingsStepComponent',

  props: {
    modelValue: Object as PropType<StepComponentProps['modelValue']>,
  },

  setup: (props, ctx) => {
    const modelValue = computed({
      get: () => props.modelValue as StepComponentProps['modelValue'],
      set: value => ctx.emit('update:modelValue', value),
    });

    const settings = computed(() => modelValue.value.settings);

    const form = ref<any | null>(null);

    const schemaType = computed(() =>
      modelValue.value.type === SchemaType.DEFAULT ? 'Schema' : 'Singleton',
    );

    watch(
      () => settings.value.enableMutations,
      value => {
        // Update the specific mutation settings to match value
        Object.assign(modelValue.value.settings, {
          enableCreateMutation: !!value,
          enableUpdateMutation: !!value,
          enableDeleteMutation: !!value,
        });
      },
    );

    const handleAddView = (): void => {
      modelValue.value.settings.views = [
        ...modelValue.value.settings.views,
        {
          name: '',
          type: null,
          settings: null,
          constraints: null,
        },
      ];
    };

    const handleRemoveView = (index: number): void => {
      // Remove the view by filtering for views that aren't at the index position
      modelValue.value.settings.views = modelValue.value.settings.views.filter(
        (_, i) => i !== index,
      );
    };

    const handleProgressStep = (): void => {
      if (form.value) {
        form.value.validate().then(() => {
          ctx.emit('progress:nextStep');
        });
      }
    };

    const handlePreviousStep = (): void => {
      if (form.value) {
        form.value.validate().then(() => {
          ctx.emit('progress:previousStep');
        });
      }
    };

    return () => {
      return (
        <div>
          <h3 class="text-xl font-semibold pb-3">Now, lets configure our {schemaType.value}!</h3>

          <blockquote class="border-l-4 rounded text-sm p-3 bg-gray-200 mb-5">
            Fields define the content that a {schemaType.value} can hold. You may add string fields
            for names and descriptions, number fields for prices, ratings, and so forth.
            <span class="block pb-2" />A {schemaType.value} can have as many fields as you desire;
            however, the more you add, the harder it may be to manage later.
          </blockquote>

          <el-form
            ref={form}
            model={modelValue.value}
            rules={fieldsStepFormRules}
            labelPosition="top"
          >
            <fieldset class="pb-3 border-b">
              <legend class="text-lg font-semibold pb-3">API Methods</legend>

              <el-form-item label="Enable Muatations?" prop="settings.enableMutations">
                <el-switch v-model={modelValue.value.settings.enableMutations} />

                <div class="el-form-item__description">
                  Controls whether mutations are enabled for the {schemaType.value}. By enabling
                  this you will have access to API methods such as:{' '}
                  <u>create{modelValue.value.name}</u>, <u>update{modelValue.value.name}</u>, and{' '}
                  <u>delete{modelValue.value.name}</u>.
                </div>
              </el-form-item>

              <el-form-item
                label="Enable Create Muatation?"
                prop="settings.enableMutations"
                class={{ hidden: !settings.value.enableMutations }}
              >
                <el-switch v-model={modelValue.value.settings.enableCreateMutation} />

                <div class="el-form-item__description">
                  Controls whether the document creation API method is enabled for the{' '}
                  {schemaType.value}. By enabling this you will be able to create{' '}
                  {modelValue.value.title} documents using the GraphQL API.
                </div>
              </el-form-item>

              <el-form-item
                label="Enable Update Muatation?"
                prop="settings.enableMutations"
                class={{ hidden: !settings.value.enableMutations }}
              >
                <el-switch v-model={modelValue.value.settings.enableUpdateMutation} />

                <div class="el-form-item__description">
                  Controls whether the document update API method is enabled for the{' '}
                  {schemaType.value}. By enabling this you will be able to update{' '}
                  {modelValue.value.title} documents using the GraphQL API.
                </div>
              </el-form-item>

              <el-form-item
                label="Enable Delete Muatation?"
                prop="settings.enableMutations"
                class={{ hidden: !settings.value.enableMutations }}
              >
                <el-switch v-model={modelValue.value.settings.enableDeleteMutation} />

                <div class="el-form-item__description">
                  Controls whether the document deletion API method is enabled for the{' '}
                  {schemaType.value}. By enabling this you will be able to delete{' '}
                  {modelValue.value.title} documents using the GraphQL API.
                </div>
              </el-form-item>
            </fieldset>

            <fieldset
              class={{ 'mt-5 pb-3 border-b': true, hidden: schemaType.value === 'Singleton' }}
            >
              <legend class="text-lg font-semibold pb-3">Document Views</legend>
              <el-form-item label="Fields to Display" prop="settings.fieldsToDisplay">
                <el-select v-model={modelValue.value.settings.fieldsToDisplay} multiple>
                  {modelValue.value.fields.map(field => {
                    return <el-option label={field.title} value={field.name} />;
                  })}
                </el-select>

                <div class="el-form-item__description">
                  The fields to be displayed in the default table view. This is only relevant if you
                  have not already defined a specific default view for the {schemaType.value}.
                </div>
              </el-form-item>

              <el-form-item label="Configured Views" prop="settings.views">
                <div class="p-3 border rounded border-dashed">
                  <p
                    class={{
                      'text-sm text-center opacity-50 py-3': true,
                      hidden: settings.value.views.length > 0,
                    }}
                  >
                    There are currently no configured views. You can add one using the button below!
                  </p>

                  {settings.value.views.map((_, index) => {
                    return (
                      <SchemaViewConfigurationComponent
                        v-model={modelValue.value.settings.views[index]}
                        {...{ 'onAction:removeView': () => handleRemoveView(index) }}
                      />
                    );
                  })}

                  <div class="flex justify-center pt-3">
                    <el-button onClick={() => handleAddView()}>
                      Add View <i class="el-icon-plus el-icon--right" />
                    </el-button>
                  </div>
                </div>

                <div class="el-form-item__description">
                  The available views for the {schemaType.value}. These will be displayed as
                  dropdown options when viewing the {schemaType.value}’s documents.
                </div>
              </el-form-item>
            </fieldset>

            <el-form-item>
              <div class="flex justify-between items-center pt-5">
                <el-button type="text" onClick={() => handlePreviousStep()}>
                  Previous Step
                </el-button>

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

export default SchemaCreateSettingsStepComponent;
