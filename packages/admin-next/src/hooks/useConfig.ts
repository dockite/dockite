import { reactive } from 'vue';

import { DockiteConfiguration } from '@dockite/types';

// @ts-expect-error DOCKITE_CONFIG is injected via webpack
const dockiteConfig: DockiteConfiguration = DOCKITE_CONFIG;

const config = reactive({
  ...dockiteConfig,
});

type UseConfigHook = DockiteConfiguration;

export const useConfig = (): UseConfigHook => {
  return config;
};

export default useConfig;
