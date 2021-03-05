import { defineComponent } from 'vue';

export const DefaultLayout = defineComponent({
  name: 'DefaultLayoutComponent',

  setup: (_, ctx) => {
    return () => <div>{ctx.slots.default && ctx.slots.default()}</div>;
  },
});

export default DefaultLayout;
