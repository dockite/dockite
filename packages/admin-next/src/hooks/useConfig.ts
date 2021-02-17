import { reactive } from 'vue';

import { DockiteConfiguration } from '@dockite/types';

const dockiteConfig: DockiteConfiguration = DOCKITE_CONFIG as any;

const config = reactive({
  ...dockiteConfig,
});

type UseConfigHook = DockiteConfiguration;

export const useConfig = (): UseConfigHook => {
  return config;
};

export default useConfig;
