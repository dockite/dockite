import { gql } from '@apollo/client/core';

export interface AvailableFieldItem {
  title: string;
  type: string;
  description: string;
}

export interface AvailableFieldsQueryResponse {
  availableFields: AvailableFieldItem[];
}

export const AVAILABLE_FIELDS_QUERY = gql`
  query AvailableFields {
    availableFields {
      title
      type
      description
    }
  }
`;

export default AVAILABLE_FIELDS_QUERY;
