import { computed, defineComponent, PropType, ref } from 'vue';

export interface CollapsableComponentProps {
  modelValue: boolean;
  title: string;
}

export const CollapsableComponent = defineComponent({
  name: 'CollapsableComponent',

  props: {
    modelValue: {
      type: Object as PropType<CollapsableComponentProps['modelValue']>,
    },

    title: {
      type: String as PropType<CollapsableComponentProps['title']>,
      required: true,
    },
  },

  emits: ['update:modelValue', 'action:removeView'],

  setup: (props, ctx) => {
    const modelValue = computed({
      get: () => props.modelValue as CollapsableComponentProps['modelValue'],
      set: value => ctx.emit('update:modelValue', value),
    });

    const container = ref<HTMLElement | null>(null);

    const handleToggleExpansion = (): void => {
      modelValue.value = !modelValue.value;
    };

    const getContainerHeight = (): string => {
      if (container.value) {
        return `${container.value.getBoundingClientRect().height}px`;
      }

      return '100%';
    };

    return () => {
      return (
        <div class="overflow-hidden">
          <div
            class={{
              'flex justify-between items-center': true,
              'bg-primary rounded-t p-3 text-white cursor-pointer transition-all duration-300': true,
              'rounded-b border': !modelValue.value,
            }}
            role="button"
            onClick={() => handleToggleExpansion()}
          >
            <span class="font-semibold">{props.title || 'Schema View Configuration Item'}</span>

            <i
              class="el-icon-arrow-down transition-all duration-300"
              style={{ transform: modelValue.value ? 'rotate(-180deg)' : 'rotate(0deg)' }}
            />
          </div>

          <div
            class={{
              'overflow-hidden transition-all duration-300': true,
              'rounded-b border-b border-l border-r': modelValue.value,
              'border-0': !modelValue.value,
            }}
            style={{
              height: modelValue.value ? getContainerHeight() : '0',
            }}
          >
            <div ref={container} class="p-3">
              {ctx.slots.default && ctx.slots.default()}
            </div>
          </div>
        </div>
      );
    };
  },
});
