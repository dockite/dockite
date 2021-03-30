import ElementPlus from 'element-plus';
import PortalVue from 'portal-vue';
import * as Vue from 'vue';

import './assets/tailwind.css';
import './assets/element.scss';

import { App } from './App';
import { bootstrapDockite, DockiteVuePlugin } from './dockite';
import { DockiteStatePlugin } from './hooks';
import { Router } from './router';

(window as any).Vue = Vue;

bootstrapDockite();

const app = Vue.createApp(App);

app.use(Router);
app.use(ElementPlus);
app.use(new DockiteVuePlugin());
app.use(new DockiteStatePlugin());
app.use(PortalVue, {
  portalName: false,
  portalTargetName: false,
});

app.mount('#app');
