import { can } from '@dockite/ability';
import { Schema, User } from '@dockite/database';
import { ExternalAuthenticationModule, GlobalContext } from '@dockite/types';
import { AuthenticationError } from 'apollo-server-express';
import { GraphQLResolveInfo } from 'graphql';
import * as typeorm from 'typeorm';

interface AuthHandlerResponse {
  internalUser: User;
  externalUser: string | null;
}

export default class Auth {
  private externalAuthenticationModule: ExternalAuthenticationModule<Schema>;

  private orm: typeof typeorm;

  private anonymousUser: User | null = null;

  constructor(
    externalAuthenticationModule: ExternalAuthenticationModule<Schema>,
    orm: typeof typeorm,
  ) {
    this.externalAuthenticationModule = externalAuthenticationModule;
    this.orm = orm;
  }

  public async handle(
    ctx: GlobalContext,
    info: GraphQLResolveInfo,
    resolverName: string,
    schema: Schema,
  ): Promise<AuthHandlerResponse> {
    if (!this.anonymousUser) {
      await this.fetchAnonymousUser();
    }

    if (!this.anonymousUser) {
      throw new Error('Failed to fetch anonymous user');
    }

    console.log({ user: ctx.user });

    if (ctx.user) {
      const user = await this.orm.getRepository(User).findOneOrFail(ctx.user.id);

      let resource = 'internal:document:read';
      let alternativeScope = `schema:${schema.name.toLowerCase()}:read`;

      if (info.operation.operation === 'mutation') {
        // This will transform mutations such as "updateBlogPost" to "update"
        const action = info.fieldName.replace(new RegExp(schema.name, 'ig'), '').toLowerCase();

        resource = `internal:document:${action}`;
        alternativeScope = `schema:${schema.name}:${action}`;
      }

      if (!can(user.normalizedScopes, resource, alternativeScope)) {
        throw new AuthenticationError('You are not authorized to perform this action');
      } else {
        return {
          internalUser: user,
          externalUser: null,
        };
      }
    }

    const authenticated = await this.externalAuthenticationModule.authenticated(
      ctx.req,
      info,
      resolverName,
      schema,
    );

    if (!authenticated) {
      throw new AuthenticationError('You must be authenticated to perform this action');
    }

    const authorized = await this.externalAuthenticationModule.authorized(
      ctx.req,
      info,
      resolverName,
      schema,
    );

    if (!authorized) {
      throw new AuthenticationError('You are not authorized to perform this action');
    }

    return {
      internalUser: this.anonymousUser,
      externalUser: typeof authenticated === 'string' ? authenticated : null,
    };
  }

  private async fetchAnonymousUser(): Promise<void> {
    const repository = this.orm.getRepository(User);

    const user = await repository.findOneOrFail({
      where: { email: 'anonymous@dockite.app' },
    });

    this.anonymousUser = user;
  }
}
