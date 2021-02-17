import { computed, defineComponent, PropType } from 'vue';

import { DockiteFieldConditionalSelectEntity } from '../types';

export const ViewComponent = defineComponent({
  name: 'DockiteFieldSelectView',

  props: {
    modelValue: {
      type: String,
    },

    field: {
      type: Object as PropType<DockiteFieldConditionalSelectEntity>,
      required: true,
    },
  },

  setup: props => {
    const label = computed(() => {
      if (!props.modelValue) {
        return 'N/A';
      }

      const optionItem = props.field.settings.options.find(
        option => option.value === props.modelValue,
      );

      if (!optionItem) {
        return 'N/A';
      }

      return optionItem.label;
    });

    return () => <span class="truncate">{label.value}</span>;
  },
});
