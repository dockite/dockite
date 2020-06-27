import { AuthenticationError, ForbiddenError } from 'apollo-server-express';
import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';
import { getRepository, Repository } from 'typeorm';
import { User, Role } from '@dockite/database';

import { GlobalContext } from '../../../common/types';
import { AuthenticationResponse } from '../types/response';
import { getConfig } from '../../../config';

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

    try {
      const correctPassword = await compare(password, user.password);

      if (!correctPassword) {
        throw new Error('Incorrect Password');
      }

      delete user.password;

      const [bearerToken, refreshToken] = await Promise.all([
        Promise.resolve(
          sign({ ...user }, config.app.secret ?? '', {
            expiresIn: '15m',
          }),
        ),
        Promise.resolve(
          sign({ ...user }, config.app.secret ?? '', {
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

    await getRepository(Role).save(role);
    const firstUser = await this.userRepository.save(user);

    Object.assign(user, firstUser);
    user.handleNormalizeScopes();

    const [bearerToken, refreshToken] = await Promise.all([
      Promise.resolve(
        sign({ ...user }, config.app.secret ?? '', {
          expiresIn: '15m',
        }),
      ),
      Promise.resolve(
        sign({ ...user }, config.app.secret ?? '', {
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
}
