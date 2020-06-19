import { AuthenticationError, ForbiddenError } from 'apollo-server-express';
import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';
import { getRepository, Repository } from 'typeorm';
import { User, Role } from '@dockite/database';

import { GlobalContext } from '../../../common/types';
import { getenv } from '../../../utils';
import { AuthenticationResponse } from '../types/response';

// const log = debug('dockite:core:authentication:resolver');

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

      const token = sign({ ...user }, getenv('APP_SECRET', 'secret'), {
        expiresIn: '1h',
      });

      ctx.res.setHeader('authorization', `Bearer ${token}`);

      ctx.res.cookie('refreshToken', token, {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      });

      return { user, token };
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

    const token = sign({ ...user }, getenv('APP_SECRET', 'secret'), {
      expiresIn: '1h',
    });

    ctx.res.setHeader('authorization', `Bearer ${token}`);

    ctx.res.cookie('refreshToken', token, {
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
    });

    return { user, token };
  }
}
