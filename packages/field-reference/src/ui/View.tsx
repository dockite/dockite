import { defineComponent, PropType } from 'vue';

import { ReferenceFieldValue } from '../types';

interface ReferenceFieldViewComponentProps {
  modelValue: ReferenceFieldValue;
}

export const ViewComponent = defineComponent({
  name: 'DockiteFieldReferenceView',

  props: {
    modelValue: {
      type: (null as any) as PropType<ReferenceFieldViewComponentProps['modelValue']>,
    },
  },

  setup: props => {
    if (props.modelValue) {
      return <span class="truncate">{props.modelValue.identifier || props.modelValue.id}</span>;
    }

    return <span class="truncate">No reference set</span>;
  },
});

export default ViewComponent;
