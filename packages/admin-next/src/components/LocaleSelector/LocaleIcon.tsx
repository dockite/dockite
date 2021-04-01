import { computed, defineComponent, PropType } from 'vue';

import { WORLD_FLAGS } from '~/common/constants';

export interface LocaleIconComponentProps {
  icon: string;
}

export const LocaleIconComponent = defineComponent({
  name: 'LocaleIconComponent',

  props: {
    icon: {
      type: String as PropType<LocaleIconComponentProps['icon']>,
    },
  },

  setup: props => {
    return () => {
      const flagFound = WORLD_FLAGS.find(
        flag => flag.name === props.icon || flag.emoji === props.icon,
      );

      if (flagFound) {
        return (
          <span
            style={{
              width: '25px',
              height: '25px',
              lineHeight: '25px',
              textAlign: 'center',
              display: 'inline-block',
            }}
          >
            {flagFound.emoji}
          </span>
        );
      }

      const src = computed(() => {
        const icon = props.icon ?? '';

        // A png will always start with the following when encoded as base64
        if (icon.startsWith('iVBORw0KGgo')) {
          return `data:image/png;base64,${icon}`;
        }

        return `data:image/jpg;base64,${icon}`;
      });

      return (
        <img
          class="inline-block"
          style={{ width: '25px', height: '25px' }}
          src={src.value}
          alt="Locale Icon"
        />
      );
    };
  },
});

export default LocaleIconComponent;
