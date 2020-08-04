import { can } from '@dockite/ability';
import { ForbiddenError } from 'apollo-server-express';
import { createMethodDecorator } from 'type-graphql';
import { FindManyResult } from '@dockite/types';
import { getScopeResourceById } from '@dockite/manager';

import { GlobalContext } from '../types';

interface AuthorizerOptions {
  fieldsOrArgsToPeek: string | string[];
  checkArgs: boolean;
  derriveAlternativeScopes: boolean;
  resourceType: string | null;
}

// Default Options
const defaultAuthorizerOptions: AuthorizerOptions = {
  fieldsOrArgsToPeek: 'id',
  checkArgs: false,
  derriveAlternativeScopes: true,
  resourceType: null,
};

const derriveAlternativeScopesAccess = (
  fields: string[],
  obj: Record<string, any>,
  resourceType: string,
  actionType: string,
  availableScopes: string[],
): boolean => {
  return fields.some(field => {
    const resourceName = getScopeResourceById(obj[field]);

    if (!resourceName) {
      return false;
    }

    return can(availableScopes, `${resourceType}:${resourceName}:${actionType}`);
  });
};

export const Authorized = (
  scope: string,
  options: Partial<AuthorizerOptions> = defaultAuthorizerOptions,
  alternativeScopes: string[] = [],
): MethodDecorator =>
  createMethodDecorator<GlobalContext>(async ({ context, args, info }, next) => {
    const mergedOptions: AuthorizerOptions = { ...defaultAuthorizerOptions, ...options };
    // If we have no user we can throw early
    if (!context.user) {
      throw new ForbiddenError('Not authorized');
    }

    // Otherwise destructure the user object to avoid typing inferrence issues
    const { user } = context;

    // Check if the user has the required scope based on the ones passed to the decorator
    if (can(user.normalizedScopes, scope, ...alternativeScopes)) {
      // If so return the resolver result
      return next();
    }

    // If we're not allowing further drilling to determine authorization
    if (!mergedOptions.derriveAlternativeScopes) {
      throw new ForbiddenError('Not authorized');
    }

    // eslint-disable-next-line prefer-const
    let [resourceType, alternativeResourceType] = scope.split(':');

    if (resourceType.toLowerCase() === 'internal') {
      resourceType = alternativeResourceType;
    }

    if (mergedOptions.resourceType) {
      resourceType = mergedOptions.resourceType;
    }

    // Get the action type which is determined by the string following the last `:` char
    const actionType = scope.split(':').pop() as string;

    const idsToPeek = Array.isArray(mergedOptions.fieldsOrArgsToPeek)
      ? mergedOptions.fieldsOrArgsToPeek
      : [mergedOptions.fieldsOrArgsToPeek];

    if (info.operation.operation === 'mutation' || mergedOptions.checkArgs === true) {
      const allowed = derriveAlternativeScopesAccess(
        idsToPeek,
        args,
        resourceType,
        actionType,
        user.normalizedScopes,
      );

      if (allowed) {
        return next();
      }

      // If no id was passed we can't do anything meaningful so we should just abort
      throw new ForbiddenError('Not Authorized');
    }

    // And then get the resolvers response
    const resolved: FindManyResult<any> | any = await next();

    if (resolved.results) {
      // If we're dealing with a collection of items
      // We filter out all results that the user isn't scoped to see.
      // For example if the results were ['123', '456'] and the user has the scope '123:read'
      (resolved as FindManyResult<any>).results = resolved.results.filter((result: any) => {
        return derriveAlternativeScopesAccess(
          idsToPeek,
          result,
          resourceType,
          actionType,
          user.normalizedScopes,
        );
      });

      return resolved;
    }

    const allowed = derriveAlternativeScopesAccess(
      idsToPeek,
      resolved,
      resourceType,
      actionType,
      user.normalizedScopes,
    );

    if (allowed) {
      return next();
    }

    throw new ForbiddenError('Not authorized');
  });
