import GraphQLJSON from 'graphql-type-json';
import { Field as GraphQLField, ObjectType } from 'type-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Webhook } from './webhook';

type JSONValue = string | number | boolean | null | JSONObject | JSONArray;

interface JSONObject {
  [x: string]: JSONValue;
}
// eslint-disable-next-line
interface JSONArray extends Array<JSONValue> { }

@Entity()
@ObjectType()
export class WebhookCall {
  @PrimaryGeneratedColumn('uuid')
  @GraphQLField()
  public id!: string;

  @Column()
  @GraphQLField()
  public success!: boolean;

  @Column()
  @GraphQLField()
  public status!: number;

  @Column('jsonb', { default: {}, nullable: true })
  @GraphQLField(_type => GraphQLJSON)
  public request!: JSONObject; // eslint-disable-line

  @Column('jsonb', { nullable: true })
  @GraphQLField(_type => GraphQLJSON)
  public response!: JSONObject; // eslint-disable-line

  @Index()
  @CreateDateColumn()
  @GraphQLField(_type => Date)
  public executedAt!: Date;

  @Index()
  @Column({ nullable: true })
  public webhookId!: string;

  @ManyToOne(
    _type => Webhook,
    webhook => webhook.calls,
    {
      onDelete: 'SET NULL',
    },
  )
  public webhook!: Webhook;
}
