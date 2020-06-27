export interface CoreConfiguration {
  app: {
    secret: string;
  };

  database: {
    host: string;
    username: string;
    password: string;
    database: string;
    port: number;
    ssl?: boolean;
  };

  entities?: string[];
  modules?: Record<'internal' | 'external', string[]>;
  fields?: string[];
}
