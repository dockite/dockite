import { createRouter, createWebHashHistory } from 'vue-router';

export const Router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: () => import('../pages/Home'),
      meta: { layout: 'Dashboard' },
    },
    {
      path: '/login',
      component: () => import('../pages/Login'),
      meta: { layout: 'Guest' },
    },
    {
      path: '/documents',
      component: () => import('../pages/Documents'),
      meta: { layout: 'Dashboard' },
    },
    {
      path: '/documents/:documentId',
      component: () => import('../pages/Documents/_Id'),
      meta: { layout: 'Dashboard' },
    },
    {
      path: '/schemas',
      component: () => import('../pages/Schemas'),
      meta: { layout: 'Dashboard' },
    },
    {
      path: '/schemas/create',
      component: () => import('../pages/Schemas/Create'),
      meta: { layout: 'Dashboard' },
    },
    // {
    //   path: '/schemas/import',
    //   component: () => import('../pages/Schemas/Import'),
    //   meta: { layout: 'Dashboard' },
    // },
    // {
    //   path: '/schemas/deleted',
    //   component: () => import('../pages/Schemas/Deleted'),
    //   meta: { layout: 'Dashboard' },
    // },
    {
      path: '/schemas/:schemaId',
      component: () => import('../pages/Schemas/_Id'),
      meta: { layout: 'Dashboard' },
    },
    {
      path: '/singletons',
      component: () => import('../pages/Singletons'),
      meta: { layout: 'Dashboard' },
    },
    {
      path: '/singletons/:singletonId',
      component: () => import('../pages/Singletons/_Id'),
      meta: { layout: 'Dashboard' },
    },
    {
      path: '/403',
      name: 'NotAuthorized',
      component: () => import('../pages/403'),
      meta: { layout: 'Dashboard' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../pages/404'),
      meta: { layout: 'Dashboard' },
    },
  ],
});

export default Router;
