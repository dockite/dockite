import { Field as GraphQLField, ObjectType } from 'type-graphql';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
@ObjectType()
export class Locale {
  @PrimaryColumn()
  @GraphQLField()
  public id!: string;

  @Column()
  @GraphQLField()
  public title!: string;

  @Column({ type: 'text' })
  @GraphQLField()
  public icon!: string;
}
