// import debug from 'debug';
import { GraphQLJSON } from 'graphql-type-json';
import { Field as GraphQLField, ObjectType, registerEnumType } from 'type-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { SchemaType } from '../types';

import { Document } from './document';
import { Field } from './field';
import { User } from './user';

// Register the enum for type-graphql
registerEnumType(SchemaType, { name: 'SchemaType' });

@Entity()
@ObjectType()
export class Schema {
  @PrimaryGeneratedColumn('uuid')
  @GraphQLField()
  public id!: string;

  @Column({ unique: true })
  @GraphQLField()
  public name!: string;

  @Column('enum', { enum: SchemaType, default: SchemaType.DEFAULT })
  @GraphQLField(_type => SchemaType)
  public type!: SchemaType;

  @Column({ type: 'jsonb' })
  @GraphQLField(_type => GraphQLJSON)
  public groups!: any; // eslint-disable-line

  @Column({ type: 'jsonb' })
  @GraphQLField(_type => GraphQLJSON)
  public settings!: any; // eslint-disable-line

  @OneToMany(
    _type => Schema,
    schema => schema.documents,
  )
  public documents!: Document[];

  @OneToMany(
    _type => Schema,
    schema => schema.revisions,
  )
  public revisions!: Document[];

  @OneToMany(
    _type => Field,
    field => field.schema,
    {
      nullable: true,
      persistence: false,
    },
  )
  @GraphQLField(_type => [Field], { nullable: true })
  public fields!: Field[];

  @Column({ nullable: true })
  @GraphQLField(_type => String, { nullable: true })
  public userId?: string | null;

  @ManyToOne(_type => User, { nullable: true, onDelete: 'SET NULL' })
  public user!: User;

  @CreateDateColumn()
  @GraphQLField()
  public createdAt!: Date;

  @UpdateDateColumn()
  @GraphQLField()
  public updatedAt!: Date;

  @Column({ nullable: true, default: null })
  @GraphQLField()
  public deletedAt!: Date;
}
