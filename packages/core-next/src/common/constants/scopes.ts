export const GLOBAL_SCOPES = ['*', '*:create', '*:read', '*:update', '*:delete'];

export const DOCUMENT_SCOPES = [
  'internal:document:create',
  'internal:document:read',
  'internal:document:update',
  'internal:document:delete',
];

export const SCHEMA_SCOPES = [
  'internal:schema:create',
  'internal:schema:read',
  'internal:schema:update',
  'internal:schema:import',
  'internal:schema:delete',
];

export const USER_SCOPES = [
  'internal:user:create',
  'internal:user:read',
  'internal:user:update',
  'internal:user:delete',
];

export const ROLE_SCOPES = [
  'internal:role:create',
  'internal:role:read',
  'internal:role:update',
  'internal:role:delete',
];

export const RELEASE_SCOPES = [
  'internal:release:create',
  'internal:release:read',
  'internal:release:update',
  'internal:release:delete',
];

export const WEBHOOK_SCOPES = [
  'internal:webhook:create',
  'internal:webhook:read',
  'internal:webhook:update',
  'internal:webhook:delete',
];

export const LOCALE_SCOPES = [
  'internal:locale:create',
  'internal:locale:read',
  'internal:locale:update',
  'internal:locale:delete',
];

export const API_KEY_SCOPES = ['internal:apikey:create', 'internal:apikey:delete'];

export const ALL_STATIC_SCOPES = [
  ...API_KEY_SCOPES,
  ...DOCUMENT_SCOPES,
  ...GLOBAL_SCOPES,
  ...LOCALE_SCOPES,
  ...RELEASE_SCOPES,
  ...ROLE_SCOPES,
  ...SCHEMA_SCOPES,
  ...USER_SCOPES,
  ...WEBHOOK_SCOPES,
];
