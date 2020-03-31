import Vue from 'vue';
import Antd from 'ant-design-vue';
import PortalVue from 'portal-vue';

import { startCase, kebabCase, camelCase, snakeCase } from 'lodash';

import App from './App.vue';
import router from './router';
import store from './store';
import apolloProvider from './apollo';
import { bootstrap } from './dockite';

window.Vue = Vue;

bootstrap();

Vue.config.productionTip = false;

Vue.use(Antd);
Vue.use(PortalVue);

Vue.filter('startCase', startCase);
Vue.filter('camelCase', camelCase);
Vue.filter('kebabCase', kebabCase);
Vue.filter('snakeCase', snakeCase);

new Vue({
  router,
  store,
  apolloProvider,
  render: h => h(App),
}).$mount('#app');
