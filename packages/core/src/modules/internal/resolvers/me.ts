import { Ctx, Query, Resolver } from 'type-graphql';

import { Authenticated } from '../../../common/authorizers';
import { GlobalContext, UserContext } from '../../../common/types';
import { Me } from '../types/me';

@Resolver()
export class MeResolver {
  @Authenticated()
  @Query(_returns => Me, { nullable: true })
  me(@Ctx() ctx: GlobalContext): UserContext | null {
    if (!ctx.user) return null;

    return {
      ...ctx.user,
      createdAt: new Date(ctx.user.createdAt),
      updatedAt: new Date(ctx.user.updatedAt),
    };
  }
}
