import { AuthenticationError } from 'apollo-server-express';
import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';
import { getRepository, Repository } from 'typeorm';

import { GlobalContext } from '../../../common/types';
import { User } from '../../../entities';
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

      return { user, token };
    } catch (err) {
      throw new AuthenticationError('Authentication failed.');
    }
  }

  @Mutation(_returns => AuthenticationResponse)
  public async register(
    @Arg('firstName') firstName: string,
    @Arg('lastName') lastName: string,
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Ctx() ctx: GlobalContext,
  ): Promise<AuthenticationResponse> {
    const user = await this.userRepository.create({
      firstName,
      lastName,
      email,
      password: await hash(password, 10),
    });

    await this.userRepository.save(user);

    delete user.password;

    const token = sign({ ...user }, getenv('APP_SECRET', 'secret'), {
      expiresIn: '1h',
    });

    ctx.res.setHeader('authorization', `Bearer ${token}`);

    return { user, token };
  }
}
