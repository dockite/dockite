import { defineComponent } from 'vue';
import { RouterView } from 'vue-router';

type DefaultLayoutProps = never;

export const DefaultLayout = defineComponent({
  name: 'DefaultLayoutComponent',

  setup: () => {
    return () => <RouterView />;
  },
});

export default DefaultLayout;
