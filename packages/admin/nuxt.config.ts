import * as path from 'path';

import { Configuration } from '@nuxt/types';
import { cosmiconfigSync } from 'cosmiconfig';
import { NormalModuleReplacementPlugin } from 'webpack';
import WebpackInjectPlugin, { ENTRY_ORDER } from 'webpack-inject-plugin';

interface DockiteConfig {
  app: {
    title: string;
    description: string;
    graphqlEndpoint: string;
  };
  fields: string[];
}

let dockiteConfig: DockiteConfig = {
  app: {
    title: 'Dockite',
    description: 'The simpler HeadlessCMS',
    graphqlEndpoint: '/dockite/graphql/internal',
  },
  fields: [],
};

const result = cosmiconfigSync('dockite').search();

if (result) {
  dockiteConfig = { ...dockiteConfig, ...result.config };
}

const config: Configuration = {
  mode: 'spa',
  env: {
    GRAPHQL_ENDPOINT: dockiteConfig.app.graphqlEndpoint,
  },
  /*
   ** Headers of the page
   */
  head: {
    title: dockiteConfig.app.title,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: dockiteConfig.app.description,
      },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff' },
  /*
   ** Global CSS
   */
  css: ['normalize.css/normalize.css', '~/assets/global.scss'],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    '~/plugins/apollo.ts',
    '~/plugins/ability.ts',
    '~/plugins/element-ui.ts',
    '~/plugins/vuex-init.ts',
    '~/plugins/portal-vue.ts',
    '~/plugins/vue-filters.ts',
    '~/plugins/dockite.ts',
  ],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    [
      '@nuxt/typescript-build',
      {
        typecheck: !process.env.CLI_BUILD,
      },
    ],
    '@nuxtjs/stylelint-module',
  ],
  /*
   ** Nuxt.js modules
   */
  modules: [
    [
      'nuxt-i18n',
      {
        locales: [
          {
            code: 'en',
            iso: 'en-US',
            name: 'English',
            file: 'en-US.json',
          },
        ],
        detectBrowserLanguage: {
          useCookie: false,
          cookieKey: 'i18n_redirected',
        },
        strategy: 'no_prefix',
        defaultLocale: 'en',
        lazy: true,
        langDir: 'lang/',
        fallbackLocale: 'en',
      },
    ],
    '@nuxtjs/pwa',
    '@nuxtjs/dotenv',
  ],
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {},
  /*
   ** Build configuration
   */
  build: {
    transpile: [/^element-ui/, /^@dockite/],
    babel: {
      presets({ isServer }) {
        const targets = isServer ? { node: '10' } : { ie: '11' };
        return [
          [
            require.resolve('@nuxt/babel-preset-app'),
            {
              targets,
              corejs: { version: 2 },
            },
          ],
        ];
      },
    },
    extend(config, { isClient }) {
      config.resolve = config.resolve ?? {};

      module.paths.push(path.join(process.cwd(), 'node_modules'));

      config.resolve.modules = config.resolve.modules ?? [];
      config.resolve.modules.push(path.join(process.cwd(), 'node_modules'));

      config.resolve.extensions = [
        ...new Set([...(config.resolve.extensions ?? []), '.graphql', '.gql']),
      ];

      config.module = config.module ?? { rules: [] };

      if (!config.module.rules.some(rule => rule.use === 'graphql-tag/loader')) {
        config.module.rules.push({
          loader: 'graphql-tag/loader',
          test: /\.g(raph)?ql$/,
        });
      }

      config.plugins = config.plugins ?? [];

      config.plugins.push(
        new NormalModuleReplacementPlugin(/type-graphql$/, (resource: any) => {
          resource.request = resource.request.replace(
            /type-graphql/,
            'type-graphql/dist/browser-shim.js',
          );
        }),
        new NormalModuleReplacementPlugin(/typeorm$/, (resource: any) => {
          resource.request = resource.request.replace(
            /typeorm/,
            path.join(
              path.dirname(require.resolve('@dockite/database')),
              'extra/typeorm-model-shim.js',
            ),
          );
        }),
      );

      if (isClient) {
        const fields = dockiteConfig.fields;

        const injectables: string[] = [];

        config.plugins = config.plugins ?? [];
        config.module = config.module ?? { rules: [] };

        fields.forEach(field => {
          const dirname = path.dirname(require.resolve(field));
          const ui = path.join(dirname, 'ui', 'index.js');
          const abs = path.resolve(ui);

          console.log(`dockite:admin:fields adding ${field}`);
          injectables.push(`import('${abs}')`);
        });

        config.plugins.push(
          new WebpackInjectPlugin(
            () => `
            const fieldManager = {};

            const registerField = (name, inputComponent, settingsComponent) => {
              if (!fieldManager[name]) {
                fieldManager[name] = {
                  input: inputComponent,
                  settings: settingsComponent,
                };
              }
            };

            if (!window.dockite) {
              console.log('Assigning to window');
              window.dockite = {};
            }

            if (!window.dockite.fieldManager) {
              console.log('Building field manager');
              window.dockite.fieldManager = fieldManager;
            }

            if (!window.dockite.registerField || typeof window.dockite.registerField !== 'function') {
              window.dockite.registerField = registerField;
            }

            window.dockiteResolveFields = [${injectables.join(',')}];
            `,
            { entryOrder: ENTRY_ORDER.First },
          ),
        );
      }
    },
  },
};

export default config;
