import { SchemaConfigurableView } from '@dockite/database';

import { BaseSchema } from '~/common/types';

export interface SchemaViewConfigurationComponentProps {
  modelValue: SchemaConfigurableView;
  schema: BaseSchema;
}
