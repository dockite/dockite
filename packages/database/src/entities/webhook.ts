/* eslint-disable @typescript-eslint/camelcase */

import GraphQLJSON from 'graphql-type-json';
import { Field as GraphQLField, ObjectType } from 'type-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { WebhookCall } from './webhook-call';

export const WebhookOperators = {
  $ilike: 'Checks for a value containing the input provided (case-insensitive)',
  $eq: 'Checks for a value is the same as the input provided',
  $ne: 'Checks for a value that is not the same as the input provided',
  $gt: 'Checks for a value that is greater than the input provided',
  $gte: 'Checks for a value that is greater than or equal to the input provided',
  $lt: 'Checks for a value that is less than the input provided',
  $lte: 'Checks for a value that is less than or equal to the input provided',
  $regex: 'Checks for a value matching the regex provided',
  $array_contains: 'Checks if an array contains the input provided',
  $array_not_contains: 'Checks if an array does not contain the input provided',
  $null: 'Checks for values which are null',
  $not_null: 'Checks for values which are not null',
};

export const WebhookSupportedOperators = Object.keys(WebhookOperators);

export type WebhookConstraintOperator = keyof typeof WebhookOperators;

export interface WebhookConstraint {
  name: string;
  operator: WebhookConstraintOperator;
  value: string;
}

export interface WebhookOptions {
  listeners: string[];
  query?: string;
  constraints?: WebhookConstraint[];
}

@Entity()
@ObjectType()
export class Webhook {
  @PrimaryGeneratedColumn('uuid')
  @GraphQLField()
  public id!: string;

  @Index()
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

  @Index()
  @CreateDateColumn()
  @GraphQLField()
  public createdAt!: Date;

  @Index()
  @UpdateDateColumn()
  @GraphQLField()
  public updatedAt!: Date;

  @OneToMany(
    _type => WebhookCall,
    call => call.webhook,
  )
  public calls!: WebhookCall[];
}
