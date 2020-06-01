export interface WebhookOptions {
  listeners: string[];
  query?: string;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  method: string;
  options: WebhookOptions;
  createdAt: Date;
  updatedAt: Date;
}
