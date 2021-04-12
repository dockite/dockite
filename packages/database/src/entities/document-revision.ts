import GraphQLJSON from 'graphql-type-json';
import { Field as GraphQLField, ObjectType } from 'type-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Document } from './document';
import { User } from './user';

@Entity()
@ObjectType()
export class DocumentRevision {
  @PrimaryGeneratedColumn('uuid')
  @GraphQLField(_type => String)
  public id!: string;

  @Column({ type: 'jsonb' })
  @GraphQLField(_type => GraphQLJSON)
  public data!: Record<string, any>; // eslint-disable-line

  @Index()
  @CreateDateColumn()
  @GraphQLField(_type => Date)
  public createdAt!: Date;

  @Index()
  @UpdateDateColumn()
  @GraphQLField(_type => Date)
  public updatedAt!: Date;

  @Index()
  @Column()
  @GraphQLField(_type => String)
  public documentId!: string;

  @Index()
  @Column()
  @GraphQLField(_type => String)
  public schemaId!: string;

  @ManyToOne(
    _type => Document,
    document => document.revisions,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  @GraphQLField(_type => Document)
  public document?: Document;

  @Column({ nullable: true })
  @GraphQLField(_type => String, { nullable: true })
  public userId?: string | null;

  @ManyToOne(_type => User, { nullable: true, onDelete: 'CASCADE' })
  @GraphQLField(_type => User, { nullable: true })
  public user?: User;
}
