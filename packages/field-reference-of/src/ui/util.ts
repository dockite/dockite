import { RESULTS_PER_PAGE } from '../types';
import { FindManyResult } from '@dockite/types';

export const getPaginationString = (paginationDetails: FindManyResult<any>): string => {
  if (!paginationDetails) {
    return '';
  }

  const { currentPage, totalItems, results } = paginationDetails;

  const itemCount = results.length;

  let startingItem = (currentPage - 1) * RESULTS_PER_PAGE + 1;

  // We apply a Math.min here to handle edge cases where there are 0 results
  // or pagination is completely borked
  startingItem = Math.min(startingItem, itemCount);

  const endingItem = Math.max(0, startingItem + (itemCount - 1));

  return `Displaying documents ${startingItem} to ${endingItem} of ${totalItems}`;
};
