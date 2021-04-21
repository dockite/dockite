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

    /**
     * Documents
     */
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
      path: '/documents/:documentId/revisions',
      component: () => import('../pages/Documents/_Id/Revisions'),
      meta: { layout: 'Dashboard' },
    },
    {
      path: '/documents/:documentId/compare',
      component: () => import('../pages/Documents/_Id/Compare'),
      meta: { layout: 'Dashboard' },
    },
    {
      path: '/documents/:documentId/delete',
      component: () => import('../pages/Documents/_Id/Delete'),
      meta: { layout: 'Dashboard' },
    },

    {
      path: '/documents/deleted/:documentId/permanent-delete',
      component: () => import('../pages/Documents/Deleted/_Id/PermanentDelete'),
      meta: { layout: 'Dashboard' },
    },
    {
      path: '/documents/deleted/:documentId/restore',
      component: () => import('../pages/Documents/Deleted/_Id/Restore'),
      meta: { layout: 'Dashboard' },
    },
    // {
    //   path: '/documents/deleted/:documentId/revisions',
    //   component: () => import('../pages/Documents/_Id/Revisions'),
    //   meta: { layout: 'Dashboard' },
    // },

    /**
     * Schemas
     */
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
    {
      path: '/schemas/import',
      component: () => import('../pages/Schemas/Import'),
      meta: { layout: 'Dashboard' },
    },

    /**
     * Deleted Schemas
     */
    {
      path: '/schemas/deleted',
      component: () => import('../pages/Schemas/Deleted'),
      meta: { layout: 'Dashboard' },
    },
    {
      path: '/schemas/deleted/:schemaId/permanent-delete',
      component: () => import('../pages/Schemas/_Id/PermanentDelete'),
      meta: { layout: 'Dashboard' },
    },
    {
      path: '/schemas/deleted/:schemaId/restore',
      component: () => import('../pages/Schemas/_Id/Restore'),
      meta: { layout: 'Dashboard' },
    },

    /**
     * Single Schema
     */
    {
      path: '/schemas/:schemaId',
      component: () => import('../pages/Schemas/_Id'),
      meta: { layout: 'Dashboard' },
    },
    {
      path: '/schemas/:schemaId/create',
      component: () => import('../pages/Schemas/_Id/Create'),
      meta: { layout: 'Dashboard' },
    },
    {
      path: '/schemas/:schemaId/edit',
      component: () => import('../pages/Schemas/_Id/Edit'),
      meta: { layout: 'Dashboard' },
    },
    {
      path: '/schemas/:schemaId/import',
      component: () => import('../pages/Schemas/_Id/Import'),
      meta: { layout: 'Dashboard' },
    },
    {
      path: '/schemas/:schemaId/delete',
      component: () => import('../pages/Schemas/_Id/Delete'),
      meta: { layout: 'Dashboard' },
    },
    {
      path: '/schemas/:schemaId/deleted',
      component: () => import('../pages/Schemas/_Id/Deleted'),
      meta: { layout: 'Dashboard' },
    },

    /**
     * Singletons
     */
    {
      path: '/singletons',
      component: () => import('../pages/Singletons'),
      meta: { layout: 'Dashboard' },
    },
    {
      path: '/singletons/create',
      component: () => import('../pages/Singletons/Create'),
      meta: { layout: 'Dashboard' },
    },
    {
      path: '/singletons/import',
      component: () => import('../pages/Singletons/Import'),
      meta: { layout: 'Dashboard' },
    },

    /**
     * Deleted Singletons
     */
    {
      path: '/singletons/deleted',
      component: () => import('../pages/Singletons/Deleted'),
      meta: { layout: 'Dashboard' },
    },
    {
      path: '/singletons/deleted/:singletonId/permanent-delete',
      component: () => import('../pages/Singletons/_Id/PermanentDelete'),
      meta: { layout: 'Dashboard' },
    },
    {
      path: '/singletons/deleted/:singletonId/restore',
      component: () => import('../pages/Singletons/_Id/Restore'),
      meta: { layout: 'Dashboard' },
    },

    /**
     * Single Singleton
     */

    {
      path: '/singletons/:singletonId',
      component: () => import('../pages/Singletons/_Id'),
      meta: { layout: 'Dashboard' },
    },
    {
      path: '/singletons/:singletonId/edit',
      component: () => import('../pages/Singletons/_Id/Edit'),
      meta: { layout: 'Dashboard' },
    },
    {
      path: '/singletons/:singletonId/delete',
      component: () => import('../pages/Singletons/_Id/Delete'),
      meta: { layout: 'Dashboard' },
    },
    {
      path: '/singletons/:singletonId/import',
      component: () => import('../pages/Singletons/_Id/Import'),
      meta: { layout: 'Dashboard' },
    },

    /**
     * Settings
     */
    {
      path: '/settings/account',
      component: () => import('../pages/Settings/Account'),
      meta: { layout: 'Dashboard' },
    },

    /**
     * Webhooks
     */
    {
      path: '/settings/webhooks',
      component: () => import('../pages/Settings/Webhooks'),
      meta: { layout: 'Dashboard' },
    },
    {
      path: '/settings/webhooks/create',
      component: () => import('../pages/Settings/Webhooks/Create'),
      meta: { layout: 'Dashboard' },
    },
    {
      path: '/settings/webhooks/:webhookId',
      component: () => import('../pages/Settings/Webhooks/_Id'),
      meta: { layout: 'Dashboard' },
    },
    {
      path: '/settings/webhooks/:webhookId/edit',
      component: () => import('../pages/Settings/Webhooks/_Id/Edit'),
      meta: { layout: 'Dashboard' },
    },

    /**
     * Locales
     */
    {
      path: '/settings/locales',
      component: () => import('../pages/Settings/Locales'),
      meta: { layout: 'Dashboard' },
    },
    {
      path: '/settings/locales/create',
      component: () => import('../pages/Settings/Locales/Create'),
      meta: { layout: 'Dashboard' },
    },
    {
      path: '/settings/locales/:localeId',
      component: () => import('../pages/Settings/Locales/_Id/Update'),
      meta: { layout: 'Dashboard' },
    },
    {
      path: '/settings/locales/:localeId/delete',
      component: () => import('../pages/Settings/Locales/_Id/Delete'),
      meta: { layout: 'Dashboard' },
    },

    /**
     * Errors
     */
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
