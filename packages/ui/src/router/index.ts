import Vue from 'vue';
import VueRouter from 'vue-router';

import DocumentEditView from '../views/document/Edit.vue';
import Home from '../views/Home.vue';
import View from '../views/schema/View.vue';

Vue.use(VueRouter);

const routes = [
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
];

const base = process.env.NODE_ENV === 'production' ? '/admin' : process.env.BASE_URL;

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

console.log('base', base, 'env', process.env.NODE_ENV);

export default router;
