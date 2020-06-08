import { Repository, getRepository, SelectQueryBuilder, EntityRepository } from 'typeorm';

import { SearchEngine } from '../entities/SearchEngine';

@EntityRepository(SearchEngine)
export class SearchEngineRepository extends Repository<SearchEngine> {
  public search(term: string): SelectQueryBuilder<SearchEngine> {
    return getRepository(SearchEngine)
      .createQueryBuilder('searchEngine')
      .where(`fts @@ to_tsquery('pg_catalog.simple', :term)`, { term });
  }
}
