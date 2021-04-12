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
  Index,
} from 'typeorm';

import { Release } from './release';
import { Schema } from './schema';
import { User } from './user';
import { DocumentRevision } from './document-revision';

@Entity()
@Index('idx_document_1', { synchronize: false })
@Index('idx_document_2', { synchronize: false })
@Index('idx_document_3', { synchronize: false })
@Index('idx_document_4', { synchronize: false })
@Index('idx_document_5', { synchronize: false })
@Index('idx_document_6', { synchronize: false })
@Index('idx_document_7', { synchronize: false })
@Index('idx_document_8', { synchronize: false })
@Index('idx_document_9', { synchronize: false })
@Index('idx_document_10', { synchronize: false })
@Index('idx_document_11', { synchronize: false })
@Index('idx_document_12', { synchronize: false })
@Index('idx_document_13', { synchronize: false })
@Index('idx_document_14', { synchronize: false })
@Index('idx_document_15', { synchronize: false })
@Index('idx_document_16', { synchronize: false })
@Index('idx_document_17', { synchronize: false })
@Index('idx_document_18', { synchronize: false })
@Index('idx_document_19', { synchronize: false })
@Index('idx_document_20', { synchronize: false })
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
      onDelete: 'SET NULL',
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

  @Column({ nullable: true })
  @GraphQLField(_type => String, { nullable: true })
  public externalUserId?: string;

  @ManyToOne(_type => User, { nullable: true, onDelete: 'SET NULL' })
  @GraphQLField(_type => User, { nullable: true })
  public user!: User;
}
