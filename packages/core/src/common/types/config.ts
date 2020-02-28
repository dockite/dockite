export interface CoreConfiguration {
  entities?: string[];
  modules?: ModuleConfiguration[];
}

export interface ModuleConfiguration {
  type: 'internal' | 'external';
  location: string;
}
