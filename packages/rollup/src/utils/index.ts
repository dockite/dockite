export const isDevelopmentMode = (): boolean =>
  String(process.env.NODE_ENV)
    .slice(0, 3)
    .toLowerCase() === 'dev';

export * from './getAdminHtmlTemplate';
