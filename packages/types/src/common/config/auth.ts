export interface Auth0AuthConfiguration {
  clientId: string;
  domain: string;
  redirectUri: string;
  audience: string;
  secretKey: string;
}

export interface InternalAuthConfiguration {
  secret: string;
}

export type AuthConfiguration = Auth0AuthConfiguration | InternalAuthConfiguration;
