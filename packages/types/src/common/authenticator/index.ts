import express from 'express';
import { GraphQLResolveInfo } from 'graphql';

import { MaybePromise } from '../util';

export interface ExternalAuthenticationModule<TSchema> {
  authenticated: (
    _req: express.Request,
    _info: GraphQLResolveInfo,
    _resolverName: string,
    _schema: TSchema,
  ) => MaybePromise<string | boolean>;
  authorized: (
    _req: express.Request,
    _info: GraphQLResolveInfo,
    _resolverName: string,
    _schema: TSchema,
  ) => MaybePromise<boolean>;
}
