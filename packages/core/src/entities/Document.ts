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
import { Document as BaseDocument } from '@dockite/types';

import { Schema } from './Schema';
import { Release } from './Release';
import { User } from './User';

@Entity()
@ObjectType()
export class Document implements BaseDocument {
  @PrimaryGeneratedColumn('uuid')
  @GraphQLField()
  public id!: string;

  @Column()
  @GraphQLField()
  public locale!: string;

  @Column({ type: 'jsonb' })
  @GraphQLField(_type => GraphQLJSON)
  public data!: any; // eslint-disable-line

  @Column({ type: 'timestamp', nullable: true, default: null })
  @GraphQLField(_type => Date, { nullable: true })
  public publishedAt?: Date | null;

  @CreateDateColumn()
  @GraphQLField()
  public createdAt!: Date;

  @UpdateDateColumn()
  @GraphQLField()
  public updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true, default: null })
  @GraphQLField(_type => Date, { nullable: true })
  public deletedAt?: Date | null;

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
  @GraphQLField(_type => Schema)
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
