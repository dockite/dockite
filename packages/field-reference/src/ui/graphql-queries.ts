import gql from 'graphql-tag';

export const ALL_SCHEMAS_QUERY = gql`
  query {
    allSchemas {
      results {
        id
        name
        title
        type
        groups
        settings
        createdAt
        updatedAt
      }

      totalItems
      totalPages
      currentPage
      hasNextPage
    }
  }
`;

export const SEARCH_DOCUMENTS_QUERY = gql`
  query SearchDocumentsBySchemaIds(
    $schemaIds: [String!]
    $page: Int = 1
    $perPage: Int = 20
    $term: String!
    $where: WhereBuilderInputType
  ) {
    searchDocuments(
      schemaIds: $schemaIds
      page: $page
      perPage: $perPage
      term: $term
      where: $where
    ) {
      results {
        id
        data
        schemaId
        updatedAt
        createdAt
      }
      totalItems
      totalPages
      currentPage
    }
  }
`;

export const GET_SCHEMA_QUERY = gql`
  query GetSchemaWithFields($id: String!) {
    getSchema(id: $id) {
      id
      name
      title
      type
      groups
      settings
      fields {
        id
        name
        title
        description
        type
        settings
      }
      createdAt
      updatedAt
    }
  }
`;
