import { Document as BaseDocument, WebhookAction } from '@dockite/types';
import GraphQLJSON from 'graphql-type-json';
import { Field as GraphQLField, ObjectType } from 'type-graphql';
import {
  AfterInsert,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  AfterUpdate,
  AfterRemove,
} from 'typeorm';

import { fireWebhooks } from '../utils/fire-webhooks';

import { Release } from './Release';
import { Schema } from './Schema';
import { User } from './User';

@Entity()
@ObjectType()
export class Document implements BaseDocument {
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

  @Column({ type: 'timestamp', nullable: true, default: null })
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

  @Column({ nullable: true })
  @GraphQLField(_type => String, { nullable: true })
  public userId?: string | null;

  @ManyToOne(_type => User, { nullable: true, onDelete: 'SET NULL' })
  public user!: User;

  @AfterInsert()
  handleAfterInsert(): void {
    fireWebhooks(this, WebhookAction.DocumentCreate);
  }

  @AfterUpdate()
  handleAfterUpdate(): void {
    fireWebhooks(this, WebhookAction.DocumentUpdate);
  }

  @AfterRemove()
  handleAfterRemove(): void {
    fireWebhooks(this, WebhookAction.DocumentDelete);
  }
}
