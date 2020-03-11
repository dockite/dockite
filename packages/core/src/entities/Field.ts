import GraphQLJSON from 'graphql-type-json';
import { Field as GraphQLField, ObjectType } from 'type-graphql';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  AfterLoad,
  getRepository,
  Repository,
} from 'typeorm';
import { Field as BaseField } from '@dockite/types';
import { DockiteField } from '@dockite/field';

import { dockiteFields } from '../fields';

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
        const entities: { [id: string]: Repository<any> } = {};

        Object.entries(Entities).forEach(([key, val]) => {
          entities[key] = getRepository(val);
        });

        this.dockiteField = new FieldClass(this, entities);
      }
    }
  }
}
