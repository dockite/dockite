export interface ApplicationConfiguration {
  title: string;
  url: string;
  authProvider: 'internal' | 'auth0';
  graphqlEndpoint: string;
}
