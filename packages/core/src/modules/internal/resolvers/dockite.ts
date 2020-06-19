/* eslint-disable max-classes-per-file */
import { FieldManager } from '@dockite/manager';
import { GraphQLJSON } from 'graphql-type-json';
import { Field, ObjectType, Query, Resolver } from 'type-graphql';

import { Authenticated } from '../../../common/decorators';

@ObjectType()
class DockiteFieldStatic {
  @Field(_type => String)
  public type!: string;

  @Field(_type => String)
  public title!: string;

  @Field(_type => String)
  public description!: string;

  @Field(_type => GraphQLJSON)
  public defaultOptions = {};
}

@Resolver()
export class Dockite {
  @Authenticated()
  @Query(_returns => DockiteFieldStatic)
  availableFields(): DockiteFieldStatic[] {
    return Object.values(FieldManager);
  }
}
