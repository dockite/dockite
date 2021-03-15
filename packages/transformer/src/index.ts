/* eslint-disable no-underscore-dangle */

import { Schema } from '@dockite/database';
import { DockiteFieldStatic, ExternalAuthenticationModule } from '@dockite/types';
import debug from 'debug';
import { GraphQLSchema } from 'graphql';
import typeorm from 'typeorm';

import DockiteSchemaOrchestrator from './schema-orchestrator';

const log = debug('dockite:transformer');

// let anonymousUser: User;

export const createSchema = (
  orm: typeof typeorm,
  schemas: Schema[],
  dockiteFieldsMap: Record<string, DockiteFieldStatic>,
  externalAuthenticationModule: ExternalAuthenticationModule<Schema>,
): Promise<GraphQLSchema> => {
  log('Creating Schema Orchestrator');
  const orchestrator = new DockiteSchemaOrchestrator(
    orm,
    schemas,
    dockiteFieldsMap,
    externalAuthenticationModule,
  );

  return orchestrator.orchestrate();
};
