import { defineComponent, PropType, ref } from 'vue';

import { useCopy } from '~/hooks';

import './ApiKey.css';

export const ApiKeyComponent = defineComponent({
  name: 'ApiKeyComponent',

  props: {
    apiKey: {
      type: String as PropType<string>,
      required: true,
    },
  },

  setup: props => {
    const copied = ref(false);

    const handleCopyKey = (): void => {
      useCopy(props.apiKey);

      copied.value = true;

      setTimeout(() => {
        if (copied.value) {
          copied.value = false;
        }
      }, 700);
    };

    return () => {
      return (
        <div class="account--api-key relative flex-1 font-mono tracking-wide transition-all duration-300">
          <span class="account--api-key__preview tracking-wide cursor-help" title={props.apiKey}>
            {props.apiKey.substring(0, 6).padEnd(40, '*')}
          </span>

          <div
            class="account--api-key__copy hidden cursor-pointer absolute top-0 left-0 w-full h-full justify-center items-center opacity-75 z-10"
            role="button"
            onClick={handleCopyKey}
          >
            {copied.value ? 'Copied!' : 'Click to copy'}
          </div>
        </div>
      );
    };
  },
});

export default ApiKeyComponent;
