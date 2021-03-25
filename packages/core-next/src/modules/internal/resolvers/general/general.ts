/* eslint-disable class-methods-use-this */
import { Query, Resolver } from 'type-graphql';

import { FieldManager } from '@dockite/manager';

import { Authenticated } from '../../../../common/decorators';

import { RegisteredDockiteField } from './types';

/**
 *
 */
@Resolver()
export class GeneralResolver {
  @Authenticated()
  @Query(_returns => [RegisteredDockiteField])
  public availableFields(): RegisteredDockiteField[] {
    return Object.values(FieldManager);
  }
}

export default GeneralResolver;
