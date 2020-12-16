import { AuthConfiguration } from './auth';
import { ApplicationConfiguration } from './app';
import { UIConfiguration } from './ui';
import { ServerConfiguration } from './server';
import { DatabaseConfiguration } from './database';
import { MailConfiguration } from './mail';

export interface DockiteConfiguration {
  app: ApplicationConfiguration;
  ui: UIConfiguration;
  server: ServerConfiguration;
  auth: AuthConfiguration;
  database: DatabaseConfiguration;
  mail: MailConfiguration;
  entities: string[];
  fields: string[];
  modules: {
    internal: string[];
    external: string[];
  };
  listeners: string[];
  custom?: any;
  overrides?: any;
  externalAuthPackage?: string;
}

export * from './auth';
export * from './app';
export * from './ui';
export * from './server';
export * from './database';
export * from './mail';
