export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface WebhookState {
  webhookId: string | null;
}

export interface CreateWebhookPayload {
  name: string;
  method: HTTPMethod;
  url: string;
  options: { query: string | null; actions: string[] };
}

export interface UpdateWebhookPayload extends CreateWebhookPayload {
  id: string;
}
