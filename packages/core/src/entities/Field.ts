import GraphQLJSON from 'graphql-type-json';
import { Field as GraphQLField, ObjectType } from 'type-graphql';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Schema } from './Schema';

@Entity()
@ObjectType()
export class Field {
  @PrimaryGeneratedColumn('uuid')
  @GraphQLField()
  public id!: string;

  @Column()
  @GraphQLField()
  public name!: string;

  @Column()
  @GraphQLField()
  public title!: string;

  @Column()
  @GraphQLField()
  public description!: string;

  @Column()
  @GraphQLField()
  public type!: string;

  @Column('jsonb', { default: {} })
  @GraphQLField(_type => GraphQLJSON)
  public settings!: any; // eslint-disable-line

  @Column()
  @GraphQLField()
  public schemaId!: string;

  @ManyToOne(
    _type => Schema,
    schema => schema.fields,
    { persistence: true },
  )
  public schema!: Schema;
}
