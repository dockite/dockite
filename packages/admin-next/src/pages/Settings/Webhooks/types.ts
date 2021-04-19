import { Webhook } from '@dockite/database';

export interface WebhookTableColumnDefaultScopedSlot {
  $index: number;
  row: Webhook;
  column: any;
}
