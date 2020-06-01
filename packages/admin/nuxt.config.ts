import path from 'path';

import { Configuration } from '@nuxt/types';
import WebpackInjectPlugin, { ENTRY_ORDER } from 'webpack-inject-plugin';

const config: Configuration = {
  mode: 'spa',
  /*
   ** Headers of the page
   */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || '',
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
    '~/plugins/element-ui.ts',
    '~/plugins/nuxt-apollo.ts',
    '~/plugins/vuex-init.ts',
    '~/plugins/portal-vue.ts',
    '~/plugins/vue-filters.ts',
    '~/plugins/dockite.ts',
  ],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: ['@nuxt/typescript-build', '@nuxtjs/stylelint-module'],
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
    '@nuxtjs/axios',
    '@nuxtjs/pwa',
    '@nuxtjs/dotenv',
    // '@nuxtjs/auth',
    '@nuxtjs/apollo',
  ],
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {},
  /*
   ** Apollo module configuration
   ** See https://github.com/nuxt-community/apollo-module
   */
  apollo: {
    includeNodeModules: true,
    tokenName: 'apollo-token',
    authenticationType: 'Bearer',
    clientConfigs: {
      default: {
        httpEndpoint: 'http://localhost:3000/dockite/graphql',
      },
    },
  },
  /*
   ** Build configuration
   */
  build: {
    transpile: [/^element-ui/],
    babel: {
      presets({ isServer }) {
        const targets = isServer ? { node: '10' } : { ie: '11' };
        return [
          [
            require.resolve('@nuxt/babel-preset-app'),
            {
              targets,
              corejs: { version: 3 },
            },
          ],
        ];
      },
    },
    extend(config, { isClient }) {
      if (isClient) {
        const fields = [
          '@dockite/field-string',
          '@dockite/field-boolean',
          '@dockite/field-number',
          '@dockite/field-datetime',
          '@dockite/field-json',
          '@dockite/field-colorpicker',
          '@dockite/field-reference',
          '@dockite/field-reference-of',
          '@dockite/field-code',
        ];

        const injectables: string[] = [];

        config.plugins = config.plugins ?? [];
        config.module = config.module ?? { rules: [] };

        fields.forEach(field => {
          const dirname = path.dirname(require.resolve(field));
          const ui = path.join(dirname, 'ui', 'index.js');
          const abs = path.resolve(ui);

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
