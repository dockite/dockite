import GraphQLJSON from 'graphql-type-json';
import { Field as GraphQLField, ObjectType } from 'type-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Schema } from './schema';
import { User } from './user';

@Entity()
@ObjectType()
export class SchemaRevision {
  @PrimaryGeneratedColumn('uuid')
  @GraphQLField(_type => String)
  public id!: string;

  @Column({ type: 'jsonb' })
  @GraphQLField(_type => GraphQLJSON)
  public data!: Record<string, any>; // eslint-disable-line

  @CreateDateColumn()
  @GraphQLField(_type => Date)
  public createdAt!: Date;

  @UpdateDateColumn()
  @GraphQLField(_type => Date)
  public updatedAt!: Date;

  @Column()
  @GraphQLField(_type => String)
  public schemaId!: string;

  @ManyToOne(
    _type => Schema,
    schema => schema.revisions,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  @GraphQLField(_type => Schema)
  public schema?: Schema;

  @Column({ nullable: true })
  @GraphQLField(_type => String, { nullable: true })
  public userId?: string | null;

  @ManyToOne(_type => User, { nullable: true, onDelete: 'SET NULL' })
  @GraphQLField(_type => User, { nullable: true })
  public user?: User;
}
