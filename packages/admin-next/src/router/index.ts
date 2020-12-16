import { createRouter, createWebHashHistory } from 'vue-router';

export const Router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: () => import(/* webpackChunkName: "home" */ '../pages/Home'),
      meta: { layout: 'Dashboard' },
    },
    {
      path: '/login',
      component: () => import(/* webpackChunkName: "login" */ '../pages/Login'),
      meta: { layout: 'Guest' },
    },
    {
      path: '/documents',
      component: () => import(/* webpackChunkName: "documents" */ '../pages/Documents'),
      meta: { layout: 'Dashboard' },
    },
    {
      path: '/documents/:documentId',
      component: () => import(/* webpackChunkName: "documents" */ '../pages/Documents/_Id'),
      meta: { layout: 'Dashboard' },
    },
    {
      path: '/schemas',
      component: () => import(/* webpackChunkName: "schemas" */ '../pages/Schemas'),
      meta: { layout: 'Dashboard' },
    },
    {
      path: '/schemas/:schemaId',
      component: () => import(/* webpackChunkName: "schemas" */ '../pages/Schemas/_Id'),
      meta: { layout: 'Dashboard' },
    },
    {
      path: '/singletons',
      component: () => import(/* webpackChunkName: "singletons" */ '../pages/Singletons'),
      meta: { layout: 'Dashboard' },
    },
    {
      path: '/singletons/:singletonId',
      component: () => import(/* webpackChunkName: "singletons" */ '../pages/Singletons/_Id'),
      meta: { layout: 'Dashboard' },
    },
    {
      path: '/403',
      name: 'NotAuthorized',
      component: () => import(/* webpackChunkName: "403" */ '../pages/403'),
      meta: { layout: 'Dashboard' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import(/* webpackChunkName: "404" */ '../pages/404'),
      meta: { layout: 'Dashboard' },
    },
  ],
});

export default Router;
