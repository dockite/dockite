export interface ApplicationConfiguration {
  title: string;
  url: string;
  rootLocale: string;
  authProvider: 'internal' | 'auth0';
  graphqlEndpoint: string;
}
