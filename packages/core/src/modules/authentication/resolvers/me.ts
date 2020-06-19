import { User } from '@dockite/database';
import { UserContext } from '@dockite/types';
import { Ctx, Query, Resolver, FieldResolver, Root } from 'type-graphql';

import { Authenticated } from '../../../common/decorators';
import { GlobalContext } from '../../../common/types';

@Resolver(_of => User)
export class MeResolver {
  @Authenticated()
  @Query(_returns => User, { nullable: true })
  async me(@Ctx() ctx: GlobalContext): Promise<UserContext | null> {
    if (!ctx.user) return null;

    return ctx.user;
  }

  @FieldResolver(_type => Date, { nullable: true })
  createdAt(@Root() user: User): Date | null {
    if (!user.createdAt) {
      return null;
    }

    return new Date(user.createdAt);
  }

  @FieldResolver(_type => Date, { nullable: true })
  updatedAt(@Root() user: User): Date | null {
    if (!user.updatedAt) {
      return null;
    }

    return new Date(user.updatedAt);
  }
}
