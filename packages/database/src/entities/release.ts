import { Field as GraphQLField, ObjectType } from 'type-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Document } from './document';
import { User } from './user';

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

  @GraphQLField(_type => [Document])
  @OneToMany(
    _type => Document,
    document => document.release,
  )
  public documents!: Document[];

  // @OneToMany(
  //   _type => Draft,
  //   draft => draft.release,
  // )
  // public drafts!: Draft[];

  @ManyToOne(_type => User)
  public user!: User;

  @Index()
  @Column()
  @GraphQLField()
  public userId!: string;

  @Column({ type: 'timestamp', nullable: true })
  @GraphQLField(_type => Date, { nullable: true })
  public scheduledFor?: Date | null;

  @Index()
  @Column({ type: 'timestamp', nullable: true })
  @GraphQLField(_type => Date, { nullable: true })
  public publishedAt?: Date | null;

  @Column({ type: 'varchar', nullable: true })
  @GraphQLField(_type => String, { nullable: true })
  public publishedBy?: string | null;

  @Index()
  @CreateDateColumn()
  @GraphQLField()
  public createdAt!: Date;

  @Index()
  @UpdateDateColumn()
  @GraphQLField()
  public updatedAt!: Date;
}
