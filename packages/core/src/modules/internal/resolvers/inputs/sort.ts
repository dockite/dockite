import { DockiteSortDirection } from '@dockite/types';
import { Field, InputType, registerEnumType } from 'type-graphql';
import { Matches } from 'class-validator';

registerEnumType(DockiteSortDirection, {
  name: 'InternalDockiteSortDirection',
});

@InputType()
export class SortInputType {
  @Matches(/^[_A-Za-z][_0-9A-Za-z]*(\.[_A-Za-z][_0-9A-Za-z]*)*$/)
  @Field(_type => String)
  public name!: string;

  @Field(_type => DockiteSortDirection)
  public direction!: DockiteSortDirection;
}
