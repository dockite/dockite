import GraphQLJSON from 'graphql-type-json';
import { Field as GraphQLField, ObjectType } from 'type-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { WebhookCall } from './webhook-call';

interface WebhookOptions {
  listeners: string[];
  query?: string;
}

@Entity()
@ObjectType()
export class Webhook {
  @PrimaryGeneratedColumn('uuid')
  @GraphQLField()
  public id!: string;

  @Column()
  @GraphQLField()
  public name!: string;

  @Column()
  @GraphQLField()
  public url!: string;

  @Column({ default: 'POST' })
  @GraphQLField()
  public method!: string;

  @Column({ type: 'jsonb', default: {} })
  @GraphQLField(_type => GraphQLJSON)
  public options!: WebhookOptions;

  @CreateDateColumn()
  @GraphQLField()
  public createdAt!: Date;

  @UpdateDateColumn()
  @GraphQLField()
  public updatedAt!: Date;

  @OneToMany(
    _type => WebhookCall,
    call => call.webhook,
  )
  public calls!: WebhookCall[];
}
