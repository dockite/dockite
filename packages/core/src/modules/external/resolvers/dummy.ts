import { Resolver, Query } from 'type-graphql';

@Resolver()
export class Dummy {
  @Query(_returns => String)
  hello(): string {
    return 'World';
  }
}
