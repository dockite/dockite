import { defineComponent, PropType } from 'vue';

export interface RenderIfComponentProps {
  condition: boolean;
}

export const RenderIfComponent = defineComponent({
  name: 'RenderIfComponent',

  props: {
    condition: {
      type: Boolean as PropType<RenderIfComponentProps['condition']>,
      required: true,
    },
  },

  setup: (props, ctx) => {
    return () => {
      if (props.condition) {
        return ctx.slots.default && ctx.slots.default();
      }

      return null;
    };
  },
});
