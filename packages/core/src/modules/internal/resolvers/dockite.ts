/* eslint-disable max-classes-per-file */
import { ObjectType, Field, Query, Resolver } from 'type-graphql';
import { GraphQLJSON } from 'graphql-type-json';

import { Authenticated } from '../../../common/authorizers';
import { dockiteFields } from '../../../fields';

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
    return Object.values(dockiteFields);
  }
}
