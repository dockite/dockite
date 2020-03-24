import Vue from 'vue';
import Antd from 'ant-design-vue';
import App from './App.vue';
import router from './router';
import store from './store';
import apolloProvider from './apollo';
import { bootstrap } from './dockite';

bootstrap();

Vue.config.productionTip = false;

Vue.use(Antd);

new Vue({
  router,
  store,
  apolloProvider,
  render: h => h(App),
}).$mount('#app');
