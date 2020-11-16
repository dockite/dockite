import GraphQLJSON from 'graphql-type-json';
import { Field as GraphQLField, ObjectType } from 'type-graphql';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Document } from './document';
import { Release } from './release';
import { Schema } from './schema';
import { User } from './user';

@Entity()
@ObjectType()
export class Draft {
  @PrimaryGeneratedColumn('uuid')
  @GraphQLField(_type => String)
  public id!: string;

  @Column()
  @GraphQLField(_type => String)
  public name!: string;

  @Column()
  @GraphQLField(_type => String)
  public locale!: string;

  @Column({ type: 'jsonb' })
  @GraphQLField(_type => GraphQLJSON)
  public data!: Record<string, any>; // eslint-disable-line

  @CreateDateColumn()
  @GraphQLField(_type => Date)
  public createdAt!: Date;

  @UpdateDateColumn()
  @GraphQLField(_type => Date)
  public updatedAt!: Date;

  @DeleteDateColumn()
  @GraphQLField(_type => Date, { nullable: true })
  public deletedAt?: Date | null;

  @Column()
  @GraphQLField(_type => String)
  public documentId!: string;

  @ManyToOne(
    _type => Document,
    document => document.drafts,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  @GraphQLField(_type => Document)
  public document?: Document;

  @Column()
  @GraphQLField(_type => String)
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
  public userId?: string;

  @ManyToOne(_type => User, { nullable: true, onDelete: 'SET NULL' })
  @GraphQLField(_type => User, { nullable: true })
  public user!: User;
}
