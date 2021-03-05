import { defineComponent, Teleport } from 'vue';

import { Logo } from '../Logo';

import { useConfig } from '~/hooks';

export const LoadingComponent = defineComponent({
  name: 'LoadingComponent',

  setup: () => {
    const config = useConfig();

    return () => (
      <>
        <Teleport to="head">
          <title>{config.app.title} | Loading...</title>
        </Teleport>

        <div class="w-screen h-screen flex flex-col items-center justify-center">
          <div class="mb-5 animate-groovy" style={{ width: '400px', height: '100px' }}>
            <Logo class="block" style={{ maxWidth: '400px', maxHeight: '100px' }} />
          </div>

          <span>We're getting everything ready, please wait...</span>
        </div>
      </>
    );
  },
});

export default LoadingComponent;
