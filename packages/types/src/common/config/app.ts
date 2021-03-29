export interface ApplicationConfiguration {
  title: string;
  url: string;
  rootLocale: {
    id: string;
    title: string;
    icon?: string;
  };
  authProvider: 'internal' | 'auth0';
  graphqlEndpoint: string;
}
