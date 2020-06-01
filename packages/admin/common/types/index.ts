export * from './graphql';
export * from './field';

export interface ManyResultSet<T> {
  results: T[];
  totalItems: number | null;
  totalPages: number | null;
  currentPage: number | null;
  hasNextPage: boolean | null;
}

export enum RequestMethod {
  DELETE = 'DELETE',
  GET = 'GET',
  PATCH = 'PATCH',
  POST = 'POST',
  PUT = 'PUT',
}
