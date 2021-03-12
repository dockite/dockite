import { getDockiteFieldRollupConfiguration } from '@dockite/rollup';

const config = getDockiteFieldRollupConfiguration();

if (Array.isArray(config.external)) {
  // Match all codemirror and codemirror/* imports, ignoring imports such as codemirror-graphql
  config.external.push(/^codemirror(\/.+)?$/);
}

export default config;
