import { Repository, getRepository, SelectQueryBuilder, EntityRepository } from 'typeorm';

import { SearchEngine } from '../entities/search-engine';

@EntityRepository(SearchEngine)
export class SearchEngineRepository extends Repository<SearchEngine> {
  public search(term: string): SelectQueryBuilder<SearchEngine> {
    const qb = getRepository(SearchEngine).createQueryBuilder('document');

    if (term !== '') {
      qb.where(
        `
        (
          fts @@ plainto_tsquery('pg_catalog.simple', :term)
          OR (document.id)::text LIKE :like
          OR (document.data ->> 'name')::text LIKE :like
          OR (document.data ->> 'title')::text LIKE :like
          OR (document.data ->> 'identifier')::text LIKE :like
        )
        `,
        { term, like: `%${term}%` },
      );
    } else {
      qb.where(`1 = 1`);
    }

    return qb;
  }
}
