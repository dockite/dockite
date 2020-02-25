import { Field as GraphQLField, ObjectType } from 'type-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Document } from './Document';
import { User } from './User';

@Entity()
@ObjectType()
export class Release {
  @PrimaryGeneratedColumn('uuid')
  @GraphQLField()
  public id!: string;

  @Column()
  @GraphQLField()
  public name!: string;

  @Column({ nullable: true })
  @GraphQLField({ nullable: true })
  public description!: string;

  @OneToMany(
    _type => Document,
    document => document.release,
  )
  public documents!: Document[];

  @ManyToOne(_type => User)
  public user!: User;

  @Column({ nullable: true })
  @GraphQLField({ nullable: true })
  public scheduledFor!: Date;

  @Column({ nullable: true })
  @GraphQLField({ nullable: true })
  public publishedAt!: Date;

  @Column({ nullable: true })
  @GraphQLField({ nullable: true })
  public publishedBy!: string;

  @CreateDateColumn()
  @GraphQLField()
  public createdAt!: Date;

  @UpdateDateColumn()
  @GraphQLField()
  public updatedAt!: Date;
}
