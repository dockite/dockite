import { defineComponent } from 'vue';
import { RouterView } from 'vue-router';

export const DefaultLayout = defineComponent({
  name: 'DefaultLayoutComponent',

  setup: () => {
    return () => <RouterView />;
  },
});

export default DefaultLayout;
