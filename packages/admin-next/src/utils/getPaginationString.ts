import { FindManyResult } from '@dockite/types';

import { DOCKITE_PAGINATION_PER_PAGE } from '~/common/constants';

/**
 *
 */
export const getPaginationString = (paginationDetails: FindManyResult<any>): string => {
  if (!paginationDetails) {
    return '';
  }

  const { currentPage, totalItems, results } = paginationDetails;

  let startingItem = (currentPage - 1) * DOCKITE_PAGINATION_PER_PAGE + 1;

  // We apply a Math.min here to handle edge cases where there are 0 results
  // or pagination is completely borked
  startingItem = Math.min(startingItem, totalItems);

  const endingItem = Math.max(0, startingItem + (results.length - 1));

  return `Displaying documents ${startingItem} to ${endingItem} of ${totalItems}`;
};

export default getPaginationString;
