import { defineComponent, PropType } from 'vue';

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

      return <img style={{ width: '25px', height: '25px' }} src={props.icon} alt="Locale Icon" />;
    };
  },
});

export default LocaleIconComponent;
