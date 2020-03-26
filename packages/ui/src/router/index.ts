import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import SchemaTableView from '../views/schema/TableView.vue';
import DocumentEditView from '../views/document/Edit.vue';

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
    path: '/schema/:schema',
    name: 'SingleSchemaView',
    component: SchemaTableView,
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

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
