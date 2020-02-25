import GraphQLJSON from 'graphql-type-json';
import { Field, ObjectType } from 'type-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { WebhookCall } from './WebhookCall';

@Entity()
@ObjectType()
export class Webhook {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  public id!: string;

  @Column()
  @Field()
  public name!: string;

  @Column()
  @Field()
  public url!: string;

  @Column({ default: 'POST' })
  @Field()
  public method!: string;

  @Column({ type: 'jsonb', default: {} })
  @Field(_type => GraphQLJSON)
  public options!: any; // eslint-disable-line

  @CreateDateColumn()
  @Field()
  public createdAt!: Date;

  @UpdateDateColumn()
  @Field()
  public updatedAt!: Date;

  @OneToMany(
    _type => WebhookCall,
    call => call.webhook,
  )
  public calls!: WebhookCall[];
}
