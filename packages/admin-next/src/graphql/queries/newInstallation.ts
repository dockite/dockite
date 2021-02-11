import gql from 'graphql-tag';

export interface NewInstallationQueryResponse {
  newInstallation: boolean;
}

export const NEW_INSTALLATION_QUERY = gql`
  query {
    newInstallation
  }
`;
