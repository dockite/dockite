import { defineComponent, PropType } from 'vue';

export interface ShowIfComponentProps {
  condition: boolean;
}

export const ShowIfComponent = defineComponent({
  name: 'ShowIfComponent',

  props: {
    condition: {
      type: Boolean as PropType<ShowIfComponentProps['condition']>,
      required: true,
    },
  },

  setup: (props, ctx) => {
    return () => {
      return (
        <div class={{ hidden: !props.condition }}>{ctx.slots.default && ctx.slots.default()}</div>
      );
    };
  },
});
