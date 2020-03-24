<template>
  <div class="document-edit">
    <div v-for="key in Object.keys(documentData)" :key="key">
      <component :is="getInputField(getFieldType(key))" :field-data="documentData[key]" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Document } from '@dockite/types';
import { gql } from 'apollo-boost';
import { fieldManager } from '../../dockite';

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
                type
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
export class DocumentEditPage extends Vue {
  public document!: Document;

  public getInputField(type: string) {
    if (fieldManager[type]) {
      return fieldManager[type].input;
    }

    return null;
  }

  public getFieldType(name: string): string {
    const found = this.fields.find(field => field.name === name);

    if (found) {
      return found.type;
    }

    return '';
  }

  get documentData(): any {
    if (this.document?.data) {
      return JSON.parse(this.document.data);
    }

    return {};
  }

  get fields(): { id: string; name: string; type: string }[] {
    if (this.document?.schema?.fields) {
      return this.document.schema.fields;
    }

    return [];
  }
}

export default DocumentEditPage;
</script>

<style></style>
