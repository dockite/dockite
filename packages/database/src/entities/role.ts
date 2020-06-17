import { Field as GraphQLField, ObjectType } from 'type-graphql';
import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity()
@ObjectType()
export class Role {
  @PrimaryColumn()
  @GraphQLField()
  public name!: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  @GraphQLField(_type => [String])
  public scopes!: string[];

  @CreateDateColumn()
  @GraphQLField()
  public createdAt!: Date;

  @UpdateDateColumn()
  @GraphQLField()
  public updatedAt!: Date;
}
