const GLOBAL_SCOPES = ['*:create', '*:read', '*:update', '*:delete'];

const DOCUMENT_SCOPES = [
  'internal:document:create',
  'internal:document:read',
  'internal:document:update',
  'internal:document:delete',
];

const SCHEMA_SCOPES = [
  'internal:schema:create',
  'internal:schema:read',
  'internal:schema:update',
  'internal:schema:import',
  'internal:schema:delete',
];

const USER_SCOPES = [
  'internal:user:create',
  'internal:user:read',
  'internal:user:update',
  'internal:user:delete',
];

const RELEASE_SCOPES = [
  'internal:release:create',
  'internal:release:read',
  'internal:release:update',
  'internal:release:delete',
];

const WEBHOOK_SCOPES = [
  'internal:webhook:create',
  'internal:webhook:read',
  'internal:webhook:update',
  'internal:webhook:delete',
];

export const scopes = [
  ...GLOBAL_SCOPES,
  ...DOCUMENT_SCOPES,
  ...SCHEMA_SCOPES,
  ...USER_SCOPES,
  ...RELEASE_SCOPES,
  ...WEBHOOK_SCOPES,
];
