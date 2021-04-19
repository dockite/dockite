import crypto from 'crypto';

import { AuthenticationError, ForbiddenError } from 'apollo-server-express';
import { compare, hash } from 'bcrypt';
import debug from 'debug';
import { omit } from 'lodash';
import { Arg, ArgsType, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { getRepository, Repository } from 'typeorm';

import { Role, User } from '@dockite/database';
import { DockiteConfiguration, GlobalContext } from '@dockite/types';

import { getConfig } from '../../../../common/config';
import { Authenticated, Authorized } from '../../../../common/decorators';
import { createJwtTokenForUser, isInternalAuth } from '../../../../common/util';

import {
  LoginInputArgs,
  LoginResponse,
  RegistrationInputArgs,
  RegistrationResponse,
} from './graphqlTypes';
import { getAnonymousUserData } from './util';

const log = debug('dockite:core:resolvers:authentication');

/**
 *
 */
@Resolver()
export class AuthenticationResolver {
  private config: DockiteConfiguration;

  private userRepository: Repository<User>;

  private roleRepository: Repository<Role>;

  constructor() {
    this.config = getConfig();

    this.userRepository = getRepository(User);

    this.roleRepository = getRepository(Role);
  }

  @Mutation(_returns => LoginResponse)
  public async login(
    @Arg('input')
    input: LoginInputArgs,
    @Ctx()
    ctx: GlobalContext,
  ): Promise<LoginResponse> {
    if (!isInternalAuth(this.config.auth)) {
      throw new ForbiddenError(
        'Login mutation is only available when using internal authentication.',
      );
    }

    try {
      const user = await this.userRepository.findOneOrFail({
        email: input.email,
      });

      const passwordIsCorrect = await compare(input.password, user.password);

      if (!passwordIsCorrect) {
        // This error will be caught and replaced in the catch block below
        throw Error('Password provided is incorrect');
      }

      const payloadForTokenCreation = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        normalizedScopes: user.normalizedScopes,
        verified: user.verified,
      };

      const token = createJwtTokenForUser(payloadForTokenCreation, ctx.res);

      return {
        user: omit(user, 'password'),
        token,
      };
    } catch (err) {
      log(err);

      throw new AuthenticationError('The username or password provided is incorrect.');
    }
  }

  @Mutation(_returns => RegistrationResponse)
  public async registerFirstUser(
    @Arg('input')
    input: RegistrationInputArgs,
  ): Promise<RegistrationResponse> {
    if (!isInternalAuth(this.config.auth)) {
      throw new ForbiddenError(
        'Registration mutation is only available when using internal authentication.',
      );
    }

    const currentlyRegisteredUsers = await this.userRepository.count({ withDeleted: true });

    if (currentlyRegisteredUsers > 0) {
      throw new ForbiddenError(
        'You can not call the registration mutation after the first user has been registered.',
      );
    }

    // If we have no other users create the base admin role and first user.
    const role = this.roleRepository.create({
      name: 'admin',
      scopes: ['*'],
    });

    const firstUser = this.userRepository.create({
      ...input,
      password: await hash(input.password, 10),
      roles: [role],
    });

    const anonymousUser = this.userRepository.create(getAnonymousUserData());

    await this.roleRepository.save(role);

    const [user] = await this.userRepository.save([firstUser, anonymousUser]);

    const token = createJwtTokenForUser({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      normalizedScopes: user.normalizedScopes,
      verified: user.verified,
    });

    return {
      user,
      token,
    };
  }

  @Authenticated()
  @Query(_returns => User)
  public async me(@Ctx() ctx: GlobalContext): Promise<User> {
    try {
      // If the user has been provided to us via context we can then fetch the user in their current state.
      const user = await this.userRepository.findOneOrFail({
        where: {
          id: ctx.user?.id,
        },
        relations: ['roles'],
      });

      Object.assign(user, { password: '' });

      return user;
    } catch (err) {
      log(err);

      throw new AuthenticationError('Authenticated user could not be found.');
    }
  }

  @Authenticated()
  @Authorized({ scope: 'internal:apikey:create' })
  @Mutation(_returns => Boolean)
  public async createApiKey(@Ctx() ctx: GlobalContext): Promise<boolean> {
    try {
      if (!ctx.user) {
        throw new ForbiddenError('You must be authenticated to perform this action');
      }

      const { id } = ctx.user;

      const user = await this.userRepository.findOneOrFail(id);

      const key = crypto
        .createHash('sha256')
        .update(Date.now().toString())
        .digest('hex')
        .slice(0, 40);

      user.apiKeys.push(key);

      await this.userRepository.save(user);

      return true;
    } catch (err) {
      log(err);

      return false;
    }
  }

  @Authenticated()
  @Authorized({ scope: 'internal:apikey:delete' })
  @Mutation(_returns => Boolean)
  public async deleteApiKey(
    @Arg('key', _type => String)
    key: string,
    @Ctx()
    ctx: GlobalContext,
  ): Promise<boolean> {
    try {
      if (!ctx.user) {
        throw new ForbiddenError('You must be authenticated to perform this action');
      }

      const { id } = ctx.user;

      const user = await this.userRepository.findOneOrFail(id);

      user.apiKeys = user.apiKeys.filter(apiKey => apiKey !== key);

      await this.userRepository.save(user);

      return true;
    } catch (err) {
      log(err);

      return false;
    }
  }
}

export default AuthenticationResolver;
