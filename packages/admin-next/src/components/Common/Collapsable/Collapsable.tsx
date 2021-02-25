import { computed, defineComponent, PropType } from 'vue';

import './Collapsable.scss';

export interface CollapsableComponentProps {
  modelValue: boolean;
  title: string;
  extra: string;
}

export const CollapsableComponent = defineComponent({
  name: 'CollapsableComponent',

  props: {
    modelValue: {
      type: Boolean as PropType<CollapsableComponentProps['modelValue']>,
    },

    title: {
      type: String as PropType<CollapsableComponentProps['title']>,
      required: true,
    },

    extra: {
      type: String as PropType<CollapsableComponentProps['extra']>,
      default: '',
    },
  },

  emits: ['update:modelValue', 'action:removeView'],

  setup: (props, ctx) => {
    const modelValue = computed({
      get: () => props.modelValue as CollapsableComponentProps['modelValue'],
      set: value => ctx.emit('update:modelValue', value),
    });

    const handleToggleExpansion = (): void => {
      modelValue.value = !modelValue.value;
    };

    return () => {
      return (
        <div class="overflow-hidden">
          <div
            class={{
              'flex justify-between items-center': true,
              'bg-primary font-semibold rounded-t p-3 text-white cursor-pointer transition-all duration-300': true,
              'rounded-b border': !modelValue.value,
            }}
            role="button"
            onClick={() => handleToggleExpansion()}
          >
            <span>{props.title || 'Schema View Configuration Item'}</span>

            <div>
              <span class="pr-5">{props.extra}</span>

              <i
                class="el-icon-arrow-down transition-all duration-300"
                style={{ transform: modelValue.value ? 'rotate(-180deg)' : 'rotate(0deg)' }}
              />
            </div>
          </div>

          <div
            class={{
              'dockite-collapsable overflow-hidden': true,
              'dockite-collapsable--active': modelValue.value,
              'rounded-b border-b border-l border-r': modelValue.value,
              'border-0': !modelValue.value,
            }}
          >
            <div class="p-3">{ctx.slots.default && ctx.slots.default()}</div>
          </div>
        </div>
      );
    };
  },
});
