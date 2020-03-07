import { Authorized, Ctx, Query, Resolver } from 'type-graphql';

import { GlobalContext, UserContext } from '../../../common/types';
import { Me } from '../types/me';

@Resolver()
export class MeResolver {
  @Authorized()
  @Query(_returns => Me, { nullable: true })
  me(@Ctx() ctx: GlobalContext): UserContext {
    return ctx.user!; // eslint-disable-line
  }
}
