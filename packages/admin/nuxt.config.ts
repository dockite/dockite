import { Configuration } from '@nuxt/types';

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
        content: process.env.npm_package_description || ''
      }
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
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
  plugins: ['~/plugins/element-ui.ts'],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: ['@nuxt/typescript-build', '@nuxtjs/stylelint-module'],
  /*
   ** Nuxt.js modules
   */
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/pwa',
    '@nuxtjs/dotenv',
    // '@nuxtjs/auth',
    '@nuxtjs/apollo',
    'nuxt-i18n'
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
    clientConfigs: {
      default: {
        httpEndpoint: 'http://localhost/dockite/graphql',
        tokenName: 'apollo-token'
      }
    }
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
              corejs: { version: 3 }
            }
          ]
        ];
      }
    }
  }
};

export default config;
