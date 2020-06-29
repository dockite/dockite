export interface CoreConfiguration {
  app: {
    secret: string;
    title: string;
    description: string;
    url: string;
    graphqlEndpoint: string;
  };

  database: {
    host: string;
    username: string;
    password: string;
    database: string;
    port: number;
    ssl?: boolean;
  };

  mail: {
    host: string;
    username: string;
    password: string;
    port: number;
    secure: boolean;
    fromAddress: string;
  };

  entities?: string[];
  modules?: Record<'internal' | 'external', string[]>;
  fields?: string[];
}
