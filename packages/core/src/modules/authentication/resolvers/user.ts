/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as crypto from 'crypto';
import * as path from 'path';
import { promises as fs } from 'fs';

import { Role, User } from '@dockite/database';
import { ForbiddenError } from 'apollo-server-express';
import { hash } from 'bcrypt';
import {
  Arg,
  Field as GraphQLField,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Ctx,
  FieldResolver,
} from 'type-graphql';
import { getRepository } from 'typeorm';
import { GlobalContext } from '@dockite/types';

import { sendMail } from '../../../mail';
import { Authenticated, Authorized } from '../../../common/decorators';
import { replaceTemplate } from '../../../utils';
import { getConfig } from '../../../config';

const config = getConfig();

@ObjectType()
class ManyUsers {
  @GraphQLField(_type => [User])
  results!: User[];

  @GraphQLField(_type => Int)
  totalItems!: number;

  @GraphQLField(_type => Int)
  currentPage!: number;

  @GraphQLField(_type => Int)
  totalPages!: number;

  @GraphQLField(_type => Boolean)
  hasNextPage!: boolean;
}

@Resolver(_of => User)
export class UserResolver {
  @Authenticated()
  @Authorized('internal:user:read', {
    derriveAlternativeScopes: false,
  })
  @Query(_returns => User, { nullable: true })
  async getUser(
    @Arg('id')
    id: string,
  ): Promise<User | null> {
    const repository = getRepository(User);

    const user = await repository.findOne({
      where: { id },
    });

    if (!user) {
      return null;
    }

    return user;
  }

  @Authenticated()
  @Authorized('internal:user:read', { derriveAlternativeScopes: false })
  @Query(_returns => ManyUsers)
  async allUsers(
    @Arg('page', _type => Int, { defaultValue: 1 })
    page: number,
    @Arg('perPage', _type => Int, { defaultValue: 20 })
    perPage: number,
  ): Promise<ManyUsers> {
    const repository = getRepository(User);

    const [results, totalItems] = await repository.findAndCount({
      order: { updatedAt: 'DESC' },
      take: perPage,
      skip: perPage * (page - 1),
    });

    const totalPages = Math.ceil(totalItems / perPage);

    return {
      results,
      currentPage: page,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
    };
  }

  @Authenticated()
  @Authorized('internal:user:create', {
    derriveAlternativeScopes: false,
  })
  @Mutation(_returns => User)
  async createUser(
    @Arg('email')
    email: string,
    @Arg('firstName')
    firstName: string,
    @Arg('lastName')
    lastName: string,
    @Arg('password')
    password: string,
    @Arg('roles', _type => [String])
    roles: string[],
    @Arg('scopes', _type => [String])
    scopes: string[],
    @Ctx()
    ctx: GlobalContext,
  ): Promise<User | null> {
    const userRepository = getRepository(User);
    const roleRepository = getRepository(Role);

    if (!ctx.user) {
      return null;
    }

    const creator = ctx.user;

    const userCount = await userRepository.count({ where: { email }, withDeleted: true });

    if (userCount > 0) {
      throw new ForbiddenError('A user already exists');
    }

    const fsPromise = fs.readFile(
      path.join(__dirname, '../mail-templates/new-account.html'),
      'utf-8',
    );

    const fetchedRoles = await Promise.all(roles.map(role => roleRepository.findOneOrFail(role)));

    const user = userRepository.create({
      firstName,
      lastName,
      email,
      password: await hash(password, 10),
      roles: fetchedRoles,
      scopes,
    });

    const emailTemplate = await fsPromise;
    const emailContent = replaceTemplate(emailTemplate, {
      appTitle: config.app.title,
      firstName: creator.firstName,
      lastName: creator.lastName,
      inviteEmail: email,
      invitePassword: password,
      appURL: config.app.url,
    });

    await Promise.all([
      userRepository.save(user),
      sendMail({
        to: email,
        subject: `Invitation to ${config.app.title}`,
        html: emailContent,
      }),
    ]);

    user.handleNormalizeScopes();

    return user;
  }

  @Authenticated()
  @Authorized('internal:user:update', {
    derriveAlternativeScopes: false,
  })
  @Mutation(_returns => User)
  async updateUser(
    @Arg('email')
    email: string,
    @Arg('firstName', _type => String, { nullable: true })
    firstName: string | null,
    @Arg('lastName', _type => String, { nullable: true })
    lastName: string | null,
    @Arg('roles', _type => [String], { nullable: true })
    roles: string[] | null,
    @Arg('scopes', _type => [String], { nullable: true })
    scopes: string[] | null,
  ): Promise<User | null> {
    const userRepository = getRepository(User);
    const roleRepository = getRepository(Role);

    const user = await userRepository.findOneOrFail({ where: { email }, relations: ['roles'] });

    if (firstName) {
      user.firstName = firstName;
    }

    if (lastName) {
      user.lastName = lastName;
    }

    if (scopes) {
      user.scopes = scopes;
    }

    if (roles) {
      const fetchedRoles = await Promise.all(roles.map(role => roleRepository.findOneOrFail(role)));

      user.roles = fetchedRoles;
    }

    await userRepository.save(user);

    return user;
  }

  @Authenticated()
  @Authorized('internal:user:update', {
    derriveAlternativeScopes: false,
  })
  @Mutation(_returns => User)
  async resetPassword(
    @Arg('email')
    email: string,
  ): Promise<User | null> {
    const userRepository = getRepository(User);

    const user = await userRepository.findOneOrFail({ where: { email }, relations: ['roles'] });
    const fsPromise = fs.readFile(
      path.join(__dirname, '../mail-templates/reset-password.html'),
      'utf-8',
    );

    const newPassword = crypto.randomBytes(6).toString('base64');

    user.password = await hash(newPassword, 10);

    const emailTemplate = await fsPromise;
    const emailContent = replaceTemplate(emailTemplate, {
      appTitle: config.app.title,
      firstName: user.firstName,
      lastName: user.lastName,
      inviteEmail: email,
      invitePassword: newPassword,
      appURL: config.app.url,
    });

    await Promise.all([
      userRepository.save(user),
      sendMail({
        to: user.email,
        subject: 'Your password has been reset',
        html: emailContent,
      }),
    ]);

    return user;
  }

  @Authenticated()
  @Authorized('internal:user:delete', {
    derriveAlternativeScopes: false,
  })
  @Mutation(_returns => Boolean)
  async removeUser(@Arg('id') id: string): Promise<boolean> {
    const repository = getRepository(User);

    try {
      const user = await repository.findOneOrFail({
        where: { id },
      });

      await repository.remove(user);

      return true;
    } catch {
      return false;
    }
  }

  @FieldResolver()
  public password(): string {
    return 'secret';
  }
}
