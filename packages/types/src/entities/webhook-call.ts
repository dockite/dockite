export interface WebhookCall {
  id: string;
  success: boolean;
  status: number;
  request: object;
  response: object;
  executedAt: Date;
  webhookId: string;
}
