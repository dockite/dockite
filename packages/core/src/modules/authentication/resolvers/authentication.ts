import crypto from 'crypto';

import { Role, User } from '@dockite/database';
import { AuthenticationError, ForbiddenError } from 'apollo-server-express';
import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';
import { getRepository, Repository } from 'typeorm';
import { omit } from 'lodash';

import { GlobalContext } from '../../../common/types';
import { getConfig } from '../../../config';
import { AuthenticationResponse } from '../types/response';
import { isInternalAuth } from '../../../utils/type-assertions';

// const log = debug('dockite:core:authentication:resolver');

const config = getConfig();

@Resolver()
export class Authentication {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = getRepository(User);
  }

  @Mutation(_returns => AuthenticationResponse)
  public async login(
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Ctx() ctx: GlobalContext,
  ): Promise<AuthenticationResponse> {
    const user = await this.userRepository.findOneOrFail({
      where: { email },
    });

    if (!isInternalAuth(config.auth)) {
      throw new Error('Authentication method is not compatible');
    }

    try {
      const correctPassword = await compare(password, user.password);

      if (!correctPassword) {
        throw new Error('Incorrect Password');
      }

      const tokenPayload = {
        id: user.id,
        firstname: user.firstName,
        lastName: user.lastName,
        email: user.email,
        verified: user.verified,
      };

      const [bearerToken, refreshToken] = await Promise.all([
        Promise.resolve(
          sign(
            { ...tokenPayload, normalizedScopes: user.normalizedScopes },
            config.auth.secret ?? '',
            {
              expiresIn: '15m',
            },
          ),
        ),
        Promise.resolve(
          sign(tokenPayload, config.auth.secret ?? '', {
            expiresIn: '3d',
          }),
        ),
      ]);

      ctx.res.setHeader('authorization', `Bearer ${bearerToken}`);

      ctx.res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      });

      return { user: omit(user, 'password'), token: bearerToken };
    } catch (err) {
      throw new AuthenticationError('Authentication failed.');
    }
  }

  @Mutation(_returns => AuthenticationResponse)
  public async registerFirstUser(
    @Arg('firstName') firstName: string,
    @Arg('lastName') lastName: string,
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Ctx() ctx: GlobalContext,
  ): Promise<AuthenticationResponse> {
    const userCount = await this.userRepository.count({ withDeleted: true });

    if (!isInternalAuth(config.auth)) {
      throw new Error('Not implemented');
    }

    if (userCount > 0) {
      throw new ForbiddenError('A user already exists');
    }

    const role = getRepository(Role).create({
      name: 'admin',
      scopes: ['*'],
    });

    const user = this.userRepository.create({
      firstName,
      lastName,
      email,
      password: await hash(password, 10),
      roles: [role],
    });

    const anonymousUser = this.userRepository.create({
      id: '99999999-9999-4999-9999-999999999999',
      firstName: 'Anonymous',
      lastName: 'User',
      email: 'anonymous@dockite.app',
      password: await hash(crypto.randomBytes(10).toString('hex'), 10),
    });

    await getRepository(Role).save(role);

    const [firstUser] = await Promise.all([
      this.userRepository.save(user),
      this.userRepository.save(anonymousUser),
    ]);

    Object.assign(user, firstUser);
    user.handleNormalizeScopes();

    const tokenPayload = {
      id: user.id,
      firstname: user.firstName,
      lastName: user.lastName,
      email: user.email,
      verified: user.verified,
    };

    const [bearerToken, refreshToken] = await Promise.all([
      Promise.resolve(
        sign(
          { ...tokenPayload, normalizedScopes: user.normalizedScopes },
          config.auth.secret ?? '',
          {
            expiresIn: '15m',
          },
        ),
      ),
      Promise.resolve(
        sign(tokenPayload, config.auth.secret ?? '', {
          expiresIn: '3d',
        }),
      ),
    ]);

    ctx.res.setHeader('authorization', `Bearer ${bearerToken}`);

    ctx.res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
    });

    return { user, token: bearerToken };
  }

  @Mutation(_returns => Boolean)
  public async logout(@Ctx() ctx: GlobalContext): Promise<true> {
    ctx.res.cookie('refreshToken', '', {
      httpOnly: true,
      expires: new Date(Date.now() - 1000 * 60 * 5),
    });

    return true;
  }
}
