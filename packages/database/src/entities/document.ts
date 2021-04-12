import GraphQLJSON from 'graphql-type-json';
import { Field as GraphQLField, ObjectType } from 'type-graphql';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { DocumentRevision } from './document-revision';
import { Release } from './release';
import { Schema } from './schema';
import { User } from './user';

@Entity()
@Index('document_idx_1', { synchronize: false })
@Index('document_idx_2', { synchronize: false })
@Index('document_idx_3', { synchronize: false })
@Index('document_idx_4', { synchronize: false })
@Index('document_idx_5', { synchronize: false })
@Index('document_idx_6', { synchronize: false })
@Index('document_idx_7', { synchronize: false })
@Index('document_idx_8', { synchronize: false })
@Index('document_idx_9', { synchronize: false })
@Index('document_idx_10', { synchronize: false })
@Index('document_idx_11', { synchronize: false })
@Index('document_idx_12', { synchronize: false })
@Index('document_idx_13', { synchronize: false })
@Index('document_idx_14', { synchronize: false })
@Index('document_idx_15', { synchronize: false })
@Index('document_idx_16', { synchronize: false })
@Index('document_idx_17', { synchronize: false })
@Index('document_idx_18', { synchronize: false })
@Index('document_idx_19', { synchronize: false })
@Index('document_idx_20', { synchronize: false })
@ObjectType()
export class Document {
  @PrimaryGeneratedColumn('uuid')
  @GraphQLField(_type => String)
  public id!: string;

  @Index()
  @Column()
  @GraphQLField(_type => String)
  public locale!: string;

  @Column({ type: 'jsonb' })
  @GraphQLField(_type => GraphQLJSON)
  public data!: Record<string, any>; // eslint-disable-line

  @Index()
  @Column({ type: 'timestamp', nullable: true, default: null })
  @GraphQLField(_type => Date, { nullable: true })
  public publishedAt?: Date | null;

  @Index()
  @CreateDateColumn()
  @GraphQLField(_type => Date)
  public createdAt!: Date;

  @Index()
  @UpdateDateColumn()
  @GraphQLField(_type => Date)
  public updatedAt!: Date;

  @Index()
  @DeleteDateColumn()
  @GraphQLField(_type => Date, { nullable: true })
  public deletedAt?: Date | null;

  @Index()
  @Column()
  @GraphQLField(_type => String)
  public schemaId!: string;

  @ManyToOne(
    _type => Schema,
    schema => schema.documents,
    {
      onDelete: 'CASCADE',
      nullable: true,
    },
  )
  @GraphQLField(_type => Schema)
  public schema!: Schema;

  @Index()
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

  @Index()
  @Column({ nullable: true })
  @GraphQLField(_type => String, { nullable: true })
  public userId?: string;

  @Index()
  @Column({ nullable: true })
  @GraphQLField(_type => String, { nullable: true })
  public externalUserId?: string;

  @ManyToOne(_type => User, { nullable: true, onDelete: 'SET NULL' })
  @GraphQLField(_type => User, { nullable: true })
  public user!: User;

  @Index()
  @Column({ nullable: true })
  @GraphQLField(_type => String, { nullable: true })
  public parentId?: string;

  @ManyToOne(_type => Document, { nullable: true, onDelete: 'CASCADE' })
  @GraphQLField(_type => Document, { nullable: true })
  public parent?: Document;
}

export const DocumentEntityProperties: Array<keyof Document> = [
  'id',
  'locale',
  'data',
  'createdAt',
  'updatedAt',
  'schemaId',
  'schema',
  'release',
  'revisions',
  'user',
];
