import { Field as GraphQLField, ObjectType } from 'type-graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class PasswordReset {
  @PrimaryGeneratedColumn('uuid')
  @GraphQLField(_type => String)
  public id!: string;

  @Column()
  @GraphQLField(_type => String)
  public userId!: string;
}
