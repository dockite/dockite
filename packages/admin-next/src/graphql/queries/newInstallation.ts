import { gql } from '@apollo/client/core';

export interface NewInstallationQueryResponse {
  newInstallation: boolean;
}

export const NEW_INSTALLATION_QUERY = gql`
  query {
    newInstallation
  }
`;
