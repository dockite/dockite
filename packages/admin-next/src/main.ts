import ElementPlus from 'element-plus';
import * as Vue from 'vue';

import './assets/tailwind.css';
import './assets/element.scss';

import { App } from './App';
import { bootstrapDockite, DockiteVuePlugin } from './dockite';
import { Router } from './router';

(window as any).Vue = Vue;

bootstrapDockite();

const app = Vue.createApp(App);

app.use(Router);
app.use(ElementPlus);
app.use(DockiteVuePlugin);

app.mount('#app');
