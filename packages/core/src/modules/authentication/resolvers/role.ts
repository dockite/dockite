/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Role } from '@dockite/database';
import { ForbiddenError } from 'apollo-server-express';
import {
  Arg,
  Field as GraphQLField,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';
import { getRepository } from 'typeorm';

import { Authenticated, Authorized } from '../../../common/decorators';

@ObjectType()
class ManyRole {
  @GraphQLField(_type => [Role])
  results!: Role[];

  @GraphQLField(_type => Int)
  totalItems!: number;

  @GraphQLField(_type => Int)
  currentPage!: number;

  @GraphQLField(_type => Int)
  totalPages!: number;

  @GraphQLField(_type => Boolean)
  hasNextPage!: boolean;
}

@Resolver(_of => Role)
export class RoleResolver {
  @Authenticated()
  @Authorized('internal:role:read', {
    derriveAlternativeScopes: false,
  })
  @Query(_returns => Role, { nullable: true })
  async getRole(
    @Arg('name')
    name: string,
  ): Promise<Role | null> {
    const repository = getRepository(Role);

    const role = await repository.findOne({
      where: { name },
    });

    if (!role) {
      return null;
    }

    return role;
  }

  @Authenticated()
  @Authorized('internal:role:read', { derriveAlternativeScopes: false })
  @Query(_returns => ManyRole)
  async allRoles(
    @Arg('page', _type => Int, { defaultValue: 1 })
    page: number,
    @Arg('perPage', _type => Int, { defaultValue: 20 })
    perPage: number,
  ): Promise<ManyRole> {
    const repository = getRepository(Role);

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
  @Authorized('internal:role:create', {
    derriveAlternativeScopes: false,
  })
  @Mutation(_returns => Role)
  async createRole(
    @Arg('name')
    name: string,
    @Arg('scopes', _type => [String])
    scopes: string[],
  ): Promise<Role | null> {
    const roleRepository = getRepository(Role);

    const roleCount = await roleRepository.count({ where: { name }, withDeleted: true });

    if (roleCount > 0) {
      throw new ForbiddenError('A role already exists');
    }
    const role = roleRepository.create({
      name,
      scopes,
    });

    await roleRepository.save(role);

    return role;
  }

  @Authenticated()
  @Authorized('internal:role:update', {
    derriveAlternativeScopes: false,
  })
  @Mutation(_returns => Role)
  async updateRole(
    @Arg('name')
    name: string,
    @Arg('scopes', _type => [String])
    scopes: string[],
  ): Promise<Role | null> {
    const roleRepository = getRepository(Role);

    const role = await roleRepository.findOneOrFail(name);

    role.scopes = scopes;

    await roleRepository.save(role);

    return role;
  }

  @Authenticated()
  @Authorized('internal:role:delete', {
    derriveAlternativeScopes: false,
  })
  @Mutation(_returns => Boolean)
  async removeRole(@Arg('name') name: string): Promise<boolean> {
    const repository = getRepository(Role);

    try {
      const role = await repository.findOneOrFail({
        where: { name },
      });

      await repository.remove(role);

      return true;
    } catch {
      return false;
    }
  }
}
