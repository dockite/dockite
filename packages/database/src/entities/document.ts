import GraphQLJSON from 'graphql-type-json';
import { Field as GraphQLField, ObjectType } from 'type-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

import { Release } from './release';
import { Schema } from './schema';
import { User } from './user';
import { DocumentRevision } from './document-revision';

@Entity()
@ObjectType()
export class Document {
  @PrimaryGeneratedColumn('uuid')
  @GraphQLField(_type => String)
  public id!: string;

  @Column()
  @GraphQLField(_type => String)
  public locale!: string;

  @Column({ type: 'jsonb' })
  @GraphQLField(_type => GraphQLJSON)
  public data!: Record<string, any>; // eslint-disable-line

  @Column({ type: 'timestamp', nullable: true, default: null })
  @GraphQLField(_type => Date, { nullable: true })
  public publishedAt?: Date | null;

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

  @OneToMany(
    _type => Document,
    document => document.revisions,
  )
  public revisions!: DocumentRevision[];

  @Column({ nullable: true })
  @GraphQLField(_type => String, { nullable: true })
  public userId?: string;

  @Column({ nullable: true })
  @GraphQLField(_type => String, { nullable: true })
  public externalUserId?: string;

  @ManyToOne(_type => User, { nullable: true, onDelete: 'SET NULL' })
  @GraphQLField(_type => User, { nullable: true })
  public user!: User;
}
