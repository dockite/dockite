export interface DatabaseConfiguration {
  host: string;
  username: string;
  password: string;
  database: string;
  port: number;
  ssl?: boolean;
  synchronize?: boolean;
  maxPoolSize?: number;
}
