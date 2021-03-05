import { computed, defineComponent, h, PropType, ref, watch } from 'vue';
import { RouteComponent, RouteLocation } from 'vue-router';

import { getLayoutComponent } from './util';

export interface LayoutManagerProps {
  route: RouteLocation;
  Component: RouteComponent;
}

export const LayoutManager = defineComponent({
  name: 'LayoutManagerComponent',

  props: {
    route: {
      type: Object as PropType<LayoutManagerProps['route']>,
      required: true,
    },

    Component: {
      type: (null as any) as PropType<LayoutManagerProps['Component']>,
    },
  },

  setup: props => {
    const metaLayout = computed(() => {
      if (props.route.meta && props.route.meta.layout) {
        return props.route.meta.layout;
      }

      return null;
    });

    const layout = ref(getLayoutComponent(metaLayout.value));

    watch(metaLayout, (value, oldValue) => {
      if (value !== oldValue) {
        layout.value = getLayoutComponent(value);
      }
    });

    return () => {
      return h(layout.value, props.Component);
    };
  },
});
