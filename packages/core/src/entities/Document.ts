import { Field as GraphQLField, ObjectType } from 'type-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import GraphQLJSON from 'graphql-type-json';

import { Schema } from './Schema';
import { Release } from './Release';
import { User } from './User';

@Entity()
@ObjectType()
export class Document {
  @PrimaryGeneratedColumn('uuid')
  @GraphQLField()
  public id!: string;

  @Column()
  @GraphQLField()
  public locale!: string;

  @Column({ type: 'jsonb' })
  @GraphQLField(_type => GraphQLJSON)
  public data!: any; // eslint-disable-line

  @Column()
  @GraphQLField()
  public publishedAt!: Date;

  @CreateDateColumn()
  @GraphQLField()
  public createdAt!: Date;

  @UpdateDateColumn()
  @GraphQLField()
  public updatedAt!: Date;

  @Column()
  @GraphQLField()
  public deletedAt!: Date;

  @Column()
  @GraphQLField()
  public schemaId!: string;

  @ManyToOne(
    _type => Schema,
    schema => schema.documents,
    {
      onDelete: 'SET NULL',
      nullable: true,
    },
  )
  public schema!: Schema;

  @Column({ nullable: true })
  @GraphQLField(_type => String, { nullable: true })
  public releaseId?: string | null;

  @ManyToOne(
    _type => Release,
    release => release.documents,
    {
      onDelete: 'SET NULL',
      nullable: true,
    },
  )
  public release!: Release;

  @Column({ nullable: true })
  @GraphQLField(_type => String, { nullable: true })
  public userId?: string | null;

  @ManyToOne(_type => User, { nullable: true, onDelete: 'SET NULL' })
  public user!: User;
}
