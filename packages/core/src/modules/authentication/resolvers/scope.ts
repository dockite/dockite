import { Query, Resolver } from 'type-graphql';
import { ScopeManager } from '@dockite/manager';

import { Authenticated } from '../../../common/decorators';

@Resolver()
export class ScopeResolver {
  @Authenticated()
  @Query(_returns => [String], { nullable: true })
  allScopes(): string[] | null {
    return ScopeManager;
  }
}
