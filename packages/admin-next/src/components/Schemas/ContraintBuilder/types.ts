import { AndQuery, OrQuery } from '@dockite/where-builder/lib/types';

import { BaseSchema } from '~/common/types';

export interface SchemaConstraintBuilderComponentProps {
  modelValue: AndQuery | OrQuery | null;
  schema: BaseSchema;
  depth: number;
}
