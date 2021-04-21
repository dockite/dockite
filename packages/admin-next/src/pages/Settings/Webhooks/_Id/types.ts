import { WebhookCall } from '@dockite/database';

export interface WebhookCallsTableColumnDefaultScopedSlot {
  $index: number;
  row: WebhookCall;
  column: any;
}
