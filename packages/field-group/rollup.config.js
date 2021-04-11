import { getDockiteFieldRollupConfiguration } from '@dockite/rollup';

const config = getDockiteFieldRollupConfiguration();

if (config.external && Array.isArray(config.external)) {
  config.external.push('vuedraggable');
}

export default config;
