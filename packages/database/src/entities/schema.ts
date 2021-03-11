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
  DeleteDateColumn,
} from 'typeorm';

import { SchemaType } from '../types';

import { Document } from './document';
import { Field } from './field';
import { User } from './user';
import { SchemaRevision } from './schema-revision';

// Register the enum for type-graphql
registerEnumType(SchemaType, {
  name: 'SchemaType',
  valuesConfig: {},
});

export interface SchemaTableViewSettings {
  fieldsToDisplay: string[];
  defaultOrderBy?: {
    column: string;
    direction: 'ASC' | 'DESC';
  };
}

export interface SchemaTreeViewSettings {
  parentField: string;
  labelField?: string;
  sortField?: string;
}

export interface SchemaGridViewSettings {
  labelField?: string;

  imageField?: string;

  defaultOrderBy?: {
    column: string;
    direction: 'ASC' | 'DESC';
  };

  fieldsToDisplay: [];
}

export interface SchemaConfigurableView<TConstraints = any[]> {
  name: string;
  type: 'table' | 'tree' | 'grid' | null;
  settings: SchemaTableViewSettings | SchemaTreeViewSettings | SchemaGridViewSettings | null;
  constraints: TConstraints | null;
}

export interface SchemaSettings extends Record<string, any> {
  // Mutations
  enableMutations: boolean;
  enableCreateMutation?: boolean;
  enableUpdateMutation?: boolean;
  enableDeleteMutation?: boolean;

  // Views
  defaultView?: string;
  fieldsToDisplay: string[];
  views: SchemaConfigurableView[];
}

@Entity()
@ObjectType()
export class Schema {
  @PrimaryGeneratedColumn('uuid')
  @GraphQLField()
  public id!: string;

  @Column({ unique: true })
  @GraphQLField()
  public name!: string;

  @Column()
  @GraphQLField()
  public title!: string;

  @Column('enum', { enum: SchemaType, default: SchemaType.DEFAULT })
  @GraphQLField(_type => SchemaType)
  public type!: SchemaType;

  @Column({ type: 'jsonb' })
  @GraphQLField(_type => GraphQLJSON)
  public groups!: any;

  @Column({ type: 'jsonb' })
  @GraphQLField(_type => GraphQLJSON)
  public settings!: SchemaSettings;

  @OneToMany(
    _type => Document,
    document => document.schema,
  )
  public documents!: Document[];

  @OneToMany(
    _type => Schema,
    schema => schema.revisions,
  )
  public revisions!: SchemaRevision[];

  @OneToMany(
    _type => Field,
    field => field.schema,
    {
      nullable: true,
      persistence: false,
      cascade: true,
      onDelete: 'CASCADE',
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

  @DeleteDateColumn()
  @GraphQLField(_type => Date, { nullable: true })
  public deletedAt?: Date | null;
}

@ObjectType()
export class Singleton extends Schema {
  @GraphQLField(_type => GraphQLJSON)
  public data!: Record<string, any>;
}
