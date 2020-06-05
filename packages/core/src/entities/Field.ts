import { DockiteField, Field as BaseField } from '@dockite/types';
import GraphQLJSON from 'graphql-type-json';
import { Field as GraphQLField, ObjectType } from 'type-graphql';
import {
  AfterLoad,
  Column,
  Entity,
  getRepository,
  ManyToOne,
  PrimaryGeneratedColumn,
  Repository,
} from 'typeorm';

import { dockiteFields } from '../fields';
import { SchemaStore } from '../server';

import { Schema } from './Schema';

import * as Entities from '.';

@Entity()
@ObjectType()
export class Field implements BaseField {
  @PrimaryGeneratedColumn('uuid')
  @GraphQLField()
  public id!: string;

  @Column()
  @GraphQLField()
  public name!: string;

  @Column()
  @GraphQLField()
  public title!: string;

  @Column()
  @GraphQLField()
  public description!: string;

  @Column()
  @GraphQLField()
  public type!: string;

  @Column('jsonb', { default: {} })
  @GraphQLField(_type => GraphQLJSON)
  public settings!: any; // eslint-disable-line

  @Column()
  @GraphQLField()
  public schemaId!: string;

  @ManyToOne(
    _type => Schema,
    schema => schema.fields,
    { persistence: true },
  )
  public schema!: Schema;

  public dockiteField?: DockiteField;

  @AfterLoad()
  public setDockiteField(): void {
    if (!this.dockiteField) {
      const FieldClass = Object.values(dockiteFields).find(field => field.type === this.type);

      if (FieldClass && typeof FieldClass === 'function') {
        // eslint-disable-next-line
        const Repositories: { [id: string]: Repository<any> } = {};

        const { schema } = SchemaStore;

        Object.entries(Entities).forEach(([key, val]) => {
          Repositories[key] = getRepository(val);
        });

        this.dockiteField = new FieldClass(this, Repositories, schema);
      }
    }
  }
}
