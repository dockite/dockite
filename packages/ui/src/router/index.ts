import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';

import DocumentEditView from '../views/document/Edit.vue';
import Home from '../views/Home.vue';
import View from '../views/schema/View.vue';

Vue.use(VueRouter);

const routes: RouteConfig[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/schema',
    name: 'AllSchemaView',
    component: () => import('../views/schema/All.vue'),
  },
  {
    path: '/schema/create',
    name: 'CreateSchema',
    component: () => import('../views/schema/Create.vue'),
  },
  {
    path: '/schema/:schema',
    name: 'SingleSchemaView',
    component: View,
  },
  {
    path: '/schema/:schema/edit',
    name: 'EditSchema',
    component: () => import('../views/schema/Edit.vue'),
  },
  {
    path: '/schema/:schema/create',
    name: 'CreateSchemaDocument',
    component: () => import('../views/document/Create.vue'),
  },
  {
    path: '/documents',
    name: 'AllDocumentsView',
    component: () => import('../views/document/All.vue'),
  },
  {
    path: '/documents/:id',
    name: 'DocumentEdit',
    component: DocumentEditView,
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
  },
  {
    path: '/settings',
    name: 'Settings',
    // route level code-splitting
    // this generates a separate chunk (Settings.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "settings" */ '../views/Settings.vue'),
    children: [
      {
        path: '',
        component: () =>
          import(/* webpackChunkName: "settings-home" */ '../views/settings/Home.vue'),
      },
      {
        path: 'webhooks',
        name: 'SettingsWebhooks',
        component: () =>
          import(/* webpackChunkName: "settings-webhooks" */ '../views/settings/Webhooks.vue'),
      },
      {
        path: 'webhooks/history',
        name: 'SettingsWebhooksHistory',
        component: () =>
          import(
            /* webpackChunkName: "settings-webhooks" */ '../views/settings/WebhooksHistory.vue'
          ),
      },
      {
        path: 'webhooks/history/:id',
        name: 'SettingsWebhooksHistoryItem',
        component: () =>
          import(
            /* webpackChunkName: "settings-webhooks" */ '../views/settings/WebhooksHistoryItem.vue'
          ),
      },
    ],
  },
];

const base = process.env.NODE_ENV === 'production' ? '/admin' : process.env.BASE_URL;

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
