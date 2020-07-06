import { GraphQLResolveInfo } from 'graphql';
import { Schema } from '@dockite/database';
import { MaybePromise } from 'type-graphql';
import { Request } from 'express';

export interface ExternalAuthenticationProvider {
  authenticated: (
    req: Request,
    info: GraphQLResolveInfo,
    resolverName: string,
    schema: Schema,
  ) => MaybePromise<string | boolean>;
  authorized: (
    req: Request,
    info: GraphQLResolveInfo,
    resolverName: string,
    schema: Schema,
  ) => MaybePromise<boolean>;
}

export interface CoreConfiguration {
  app: {
    secret: string;
    title: string;
    description: string;
    url: string;
    graphqlEndpoint: string;
  };

  database: {
    host: string;
    username: string;
    password: string;
    database: string;
    port: number;
    ssl?: boolean;
  };

  mail: {
    host: string;
    username: string;
    password: string;
    port: number;
    secure: boolean;
    fromAddress: string;
  };

  externalAuthPackage?: string;
  entities?: string[];
  modules?: Record<'internal' | 'external', string[]>;
  fields?: string[];
}
