import { getDockiteFieldRollupConfiguration } from '@dockite/rollup';

const config = getDockiteFieldRollupConfiguration();

if (Array.isArray(config.external)) {
  config.external.push('vue-draggable');
}

export default config;
