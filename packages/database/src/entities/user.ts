import { Field as GraphQLField, ObjectType } from 'type-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  AfterLoad,
} from 'typeorm';
import { flatMap } from 'lodash';

import { Role } from './role';

@Entity()
@ObjectType()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @GraphQLField()
  public id!: string;

  @Column()
  @GraphQLField()
  public firstName!: string;

  @Column()
  @GraphQLField()
  public lastName!: string;

  @Column()
  public password!: string;

  @Column({ unique: true })
  @GraphQLField()
  public email!: string;

  @GraphQLField(_type => [Role])
  @ManyToMany(_type => Role, { eager: true })
  @JoinTable()
  public roles!: Role[];

  @Column({ type: 'jsonb', default: () => "'[]'" })
  @GraphQLField(_type => [String])
  public scopes!: string[];

  @Column({ type: 'jsonb', default: () => "'[]'" })
  @GraphQLField(_type => [String])
  public apiKeys!: string[];

  @GraphQLField(_type => [String])
  public normalizedScopes!: string[];

  @CreateDateColumn()
  @GraphQLField()
  public createdAt!: Date;

  @UpdateDateColumn()
  @GraphQLField()
  public updatedAt!: Date;

  @Column({ default: false })
  @GraphQLField()
  public verified!: boolean;

  @AfterLoad()
  handleNormalizeScopes(): void {
    const additionalScopes = flatMap(this.roles, role => role.scopes);

    const allScopes = [...this.scopes, ...additionalScopes];

    this.normalizedScopes = [...new Set(allScopes)];
  }
}
