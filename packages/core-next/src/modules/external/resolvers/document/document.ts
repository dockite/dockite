/* eslint-disable class-methods-use-this */
import { Query, Resolver } from 'type-graphql';

/**
 *
 */
@Resolver()
export class DocumentResolver {
  @Query(_returns => String)
  public hello(): string {
    return 'world';
  }
}

export default DocumentResolver;
