import { reactive, ref, toRaw } from 'vue';

import { Document } from '@dockite/database';
import { DockiteGraphQLSortInput, FindManyResult } from '@dockite/types';
import { Constraint, Operators, SupportedOperators } from '@dockite/where-builder/lib/types';

import { RESULTS_PER_PAGE } from '../types';

export interface DocumentTableState {
  term: string;
  filters: Record<string, Nullable<Constraint>>;
  sortBy: Nullable<DockiteGraphQLSortInput>;
}

export interface DocumentTableColumn {
  name: string;
  label: string;
  filterable: boolean;
}

export interface DocumentTableColumnDefaultScopedSlot {
  $index: number;
  row: Document;
  column: any;
}

export type Nullable<T> = T | null;

export const getFilterComponent = (
  filters: Record<string, Nullable<Constraint>>,
  column: DocumentTableColumn,
  handleApplyConstraint: (column: DocumentTableColumn, constraint: Constraint) => void,
  handleResetConstraint: (column: DocumentTableColumn) => void,
): JSX.Element => {
  const filter = filters[column.name];

  const label = filter ? `"${filter.operator}" ${filter.value}` : 'Apply a filter...';

  const popover = ref<any>(null);

  const input = ref<any>(null);

  const state = reactive<Constraint>({
    name: column.name,
    operator: filter?.operator || '$ilike',
    value: filter?.value || '',
  });

  const handleResetFilter = (): void => {
    state.operator = '$ilike';
    state.value = '';

    popover.value.hide();

    handleResetConstraint(column);
  };

  const handleApplyFilter = (): void => {
    popover.value.hide();

    handleApplyConstraint(column, toRaw(state));
  };

  const handleFocusPopover = (): void => {
    // We want to get the next tick of the event loop to ensure the animation frame
    // has cleared
    setImmediate(() => input.value && input.value.focus());
  };

  return (
    <el-popover
      onAfterEnter={handleFocusPopover}
      trigger="click"
      width="250px"
      placement="bottom"
      ref={popover}
    >
      {{
        default: () => (
          <div class="el-table__filter flex flex-col -my-2">
            <div class="w-full flex items-center justify-between text-xs py-2 el-table__filter-header">
              <span>Apply a Filter</span>

              <el-tooltip placement="top">
                {{
                  default: () => <i class="el-icon-question" />,
                  content: () => (
                    <div>
                      {Object.entries(Operators).map(([name, desc]) => (
                        <span class="block">
                          <strong>{name}:</strong> {desc}
                        </span>
                      ))}
                    </div>
                  ),
                }}
              </el-tooltip>
            </div>

            <div class="w-full el-table__filter-input py-2">
              <el-input
                ref={input}
                v-model={state.value}
                // I would use withModifiers here if it worked
                onKeyDown={(e: KeyboardEvent) => e.keyCode === 13 && handleApplyFilter()}
                placeholder="Value"
                size="small"
                type="text"
              >
                {{
                  append: () => (
                    <el-select v-model={state.operator} filterable size="small" style="width: 80px">
                      {SupportedOperators.map(operator => (
                        <el-option value={operator} modelValue={operator} />
                      ))}
                    </el-select>
                  ),
                }}
              </el-input>
            </div>

            <div class="w-full py-2 flex items-center justify-between el-table__filter-actions">
              <el-button onClick={handleResetFilter} type="text" size="mini">
                Reset
              </el-button>

              <el-button onClick={handleApplyFilter} type="primary" size="mini">
                Apply
              </el-button>
            </div>
          </div>
        ),

        reference: () => (
          <div class="text-xs mt-1 font-normal bg-gray-200 rounded px-2 cursor-pointer flex justify-between items-center w-full overflow-hidden">
            <div class={{ 'font-bold': !!filter, truncate: true }}>{label}</div>

            <i class="el-icon-arrow-down" />
          </div>
        ),
      }}
    </el-popover>
  );
};

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
