import { FieldManager, SchemaManager } from '@dockite/manager';
import { DockiteField, FieldSettings } from '@dockite/types';
import GraphQLJSON from 'graphql-type-json';
import { Field as GraphQLField, ObjectType } from 'type-graphql';
import { AfterLoad, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import * as typeorm from 'typeorm';

import { Schema } from './schema';

@Entity()
@ObjectType()
export class Field {
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
  public settings!: FieldSettings;

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
      const FieldClass = Object.values(FieldManager).find(field => field.type === this.type);

      if (FieldClass && typeof FieldClass === 'function') {
        this.dockiteField = new FieldClass(this, typeorm, FieldManager, SchemaManager);
      }
    }
  }
}

const OmittedFields = ['schema', 'dockiteField', 'setDockiteField'] as const;

export type BaseField = Omit<Field, typeof OmittedFields[number]> & {
  id?: string;
};
