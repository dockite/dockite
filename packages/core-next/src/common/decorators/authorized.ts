/* eslint-disable prefer-const */
import { AuthenticationError, ForbiddenError } from 'apollo-server-express';
import { get } from 'lodash';
import { createMethodDecorator } from 'type-graphql';
import { getRepository } from 'typeorm';

import { can } from '@dockite/ability';
import { getScopeResourceById } from '@dockite/manager';
import { FindManyResult, GlobalContext } from '@dockite/types';

import { EntityLike } from '../../database/types';

export interface AuthorizedDecoratorArgs {
  scope: string;
  alternativeScopes: string[];
  deriveFurtherAlternativeScopes: boolean;

  checkArgsOrFields: boolean;
  fieldsOrArgsToLookup: string[];

  resourceType?: string;

  entity?: EntityLike;
  entityIdentifierArgument?: string;
}

export const DEFAULT_AUTHORIZER_ARGS: AuthorizedDecoratorArgs = {
  scope: '*',
  alternativeScopes: [],
  deriveFurtherAlternativeScopes: false,

  checkArgsOrFields: false,
  fieldsOrArgsToLookup: ['id'],
};

/**
 * Gets the merged arguments from the user provided input and defaults provided above.
 */
const getMergedArgs = (payload: Partial<AuthorizedDecoratorArgs>): AuthorizedDecoratorArgs => {
  return {
    ...DEFAULT_AUTHORIZER_ARGS,
    ...payload,
  };
};

/**
 * Determines whether a user can access the resource with a set of derrived scopes based on the provided
 * record <object> and the attributes to check on the provided record.
 *
 * This largely assumes that it will be able to match a uuid to an entity name and perform a `can` from there.
 */
const canWithDerrivedScopes = (
  attributesToCheck: string[],
  record: Record<string, any>,
  resourceType: string,
  resourceAction: string,
  userScopes: string[],
): boolean => {
  // Check each attribute and see if any returns truthy
  return attributesToCheck.some(attribute => {
    const value = get(record, attribute);

    // If attribute doesn't have have the specfied record we can return early
    if (!value) {
      return false;
    }

    const resourceName = getScopeResourceById(value);

    // We can also return early if the resource name was not found
    if (!resourceName) {
      return false;
    }

    // Otherwise determine whether the user can perform the action with the new scope
    return can(userScopes, `${resourceType}:${resourceName}:${resourceAction}`);
  });
};

/**
 * Determines whether the current user is authorized to perform the current action.
 *
 * Intended to run as a middleware for resolvers.
 *
 * !: Reader beware, this is one of the more complicated aspects of Dockite since scopes can
 * !: come and go as schemas are created and deleted we have to do some extra work on the authorization
 * !: level to ensure that users are only able to access permitted items.
 *
 * TODO: Identify opportunities to shorten this method by grouping returns or eliminating redundant paths.
 */
export const Authorized = (payload: Partial<AuthorizedDecoratorArgs>): MethodDecorator => {
  // Get the resolved arguments applying defaults where required
  const mergedArgs = getMergedArgs(payload);

  let {
    scope,
    alternativeScopes,
    deriveFurtherAlternativeScopes,

    checkArgsOrFields,
    fieldsOrArgsToLookup,

    resourceType,

    entity,
    entityIdentifierArgument,
  } = mergedArgs;

  return createMethodDecorator<GlobalContext>(async ({ context, args, info }, next) => {
    if (!context.user) {
      throw new AuthenticationError(
        'You are not currently authenticated, please log in and try again.',
      );
    }

    const { user } = context;

    const userNormalizedScopes = user.normalizedScopes ?? [];

    // If the user can access the resource with just the provided scopes
    // we can progress down the happy path
    if (can(userNormalizedScopes, scope, ...alternativeScopes)) {
      return next();
    }

    // If we aren't attempting to derrive further scopes then we should abort early to avoid
    // any further overhead
    if (!deriveFurtherAlternativeScopes) {
      throw new ForbiddenError(
        `You are not authorized to perform this ${info.operation.operation}`,
      );
    }

    // If our scope is a wildcard rather than a fully qualified scope then we can not derrive
    // further scopes
    if (scope.split(':').length < 2) {
      throw new ForbiddenError(
        `You are not authorized to perform this ${info.operation.operation}`,
      );
    }

    const [resourceEntity, resourceEntityName, resourceAction] = scope.toLowerCase().split(':');

    // If the resource type hasn't already been defined we can derrive a resource type from the
    // provided scope
    if (!resourceType) {
      // Given that the structure of the scope is `entity:name:action` or `internal:entity:action`
      // we can use either the first or second segments to create a qualified resourceType
      resourceType = resourceEntity === 'internal' ? resourceEntityName : resourceEntity;
    }

    // If an entity was provided then it is assumed that we will want to retrieve
    // the relevant item within the database and perform a scope check against it
    if (entity && entityIdentifierArgument) {
      const item = getRepository(entity).findOne(get(args, entityIdentifierArgument));

      if (!item) {
        throw new ForbiddenError(
          `You are not authorized to perform this ${info.operation.operation}`,
        );
      }

      const authorized = canWithDerrivedScopes(
        fieldsOrArgsToLookup,
        item,
        resourceType,
        resourceAction,
        userNormalizedScopes,
      );

      if (authorized) {
        return next();
      }
    }

    if (info.operation.operation === 'mutation' && checkArgsOrFields) {
      let authorized = false;

      // When dealing with `input` which is exclusively used for mutations
      // we will make note of an array inputs to validate against each input item.
      //
      // This is relevant for `<action>Many` mutations and will provide a greater level of security.
      if ('input' in args && Array.isArray(args.input)) {
        authorized = args.input.some(arg => {
          return canWithDerrivedScopes(
            fieldsOrArgsToLookup,
            arg,
            resourceType as string,
            resourceAction,
            userNormalizedScopes,
          );
        });
      }

      // If the args provided weren't an array or didn't pass the
      // provided condition then we will test again just using the
      // root args
      if (!authorized) {
        authorized = canWithDerrivedScopes(
          fieldsOrArgsToLookup,
          args,
          resourceType,
          resourceAction,
          userNormalizedScopes,
        );
      }

      if (authorized) {
        return next();
      }

      // In the event that the operation is a mutation and we still can't determine if the user can
      // perform the action we should abort before any dangerous operations occur
      throw new ForbiddenError(
        `You are not authorized to perform this ${info.operation.operation}`,
      );
    }

    // If we still haven't been able to determine whether the user is authorized to perform the operation
    // we can await the result knowing that it is only a query and derrive based on the query result.
    const resolved: any = await next();

    // If we're dealing a paginated result then we can filter out any items which the user is not authorized to
    // see.
    // !: This can cause incorrect pagination values to be shown.
    if (resolved && resolved.results) {
      const resolvedFindManyRequest = resolved as FindManyResult<any>;

      const filteredResults = resolvedFindManyRequest.results.filter(item =>
        canWithDerrivedScopes(
          fieldsOrArgsToLookup,
          item,
          resourceType as string,
          resourceAction,
          userNormalizedScopes,
        ),
      );

      return { ...resolvedFindManyRequest, results: filteredResults };
    }

    // In the event that we're dealing with a normal query which returns a singular value
    // we just simply check it and determine the response based on whether the user has an
    // applicable scope.
    const authorized = canWithDerrivedScopes(
      fieldsOrArgsToLookup,
      resolved,
      resourceType,
      resourceAction,
      userNormalizedScopes,
    );

    if (!authorized) {
      throw new ForbiddenError(
        `You are not authorized to perform this ${info.operation.operation}`,
      );
    }

    return resolved;
  });
};

export default Authorized;
