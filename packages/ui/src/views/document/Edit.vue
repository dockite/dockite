<template>
  <div class="document-edit">
    <pre>{{ JSON.stringify(document, null, 2) }}</pre>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { gql } from 'apollo-boost';

@Component({
  apollo: {
    document: {
      query: gql`
        query FindDocumentById($id: String!) {
          document: getDocument(id: $id) {
            id
            locale
            data
            publishedAt
            createdAt
            updatedAt
            deletedAt
            schemaId
            releaseId
            userId
            schema {
              id
              name
              fields {
                id
                name
              }
            }
          }
        }
      `,

      variables() {
        return {
          id: this.$route.params.id,
        };
      },
    },
  },
})
export class DocumentEditPage extends Vue {}

export default DocumentEditPage;
</script>

<style></style>
