import { Repository, getRepository, SelectQueryBuilder, EntityRepository } from 'typeorm';

import { SearchEngine } from '../entities/search-engine';

@EntityRepository(SearchEngine)
export class SearchEngineRepository extends Repository<SearchEngine> {
  public search(term: string): SelectQueryBuilder<SearchEngine> {
    const qb = getRepository(SearchEngine).createQueryBuilder('searchEngine');

    if (term !== '') {
      qb.where(`fts @@ to_tsquery('pg_catalog.simple', :term)`, { term });
      qb.orWhere(`(searchEngine.id)::text LIKE :like`, { like: `%${term}%` });
    } else {
      qb.where(`1 = 1`);
    }

    return qb;
  }
}
