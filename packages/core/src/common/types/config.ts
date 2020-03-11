export interface CoreConfiguration {
  entities?: string[];
  modules?: ModuleConfiguration[];
  fields?: string[];
}

export interface ModuleConfiguration {
  type: 'internal' | 'external';
  location: string;
}
