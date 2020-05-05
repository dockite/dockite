import { FindManyResult } from '@dockite/types';

// eslint-disable-next-line
export const baseFindManyResult: FindManyResult<any> = {
  results: [],
  currentPage: 1,
  hasNextPage: false,
  totalItems: 0,
  totalPages: 1,
};
