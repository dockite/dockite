<template>
  <el-form-item
    :label="fieldConfig.title"
    :prop="name"
  >
    <el-table
      :max-height="400"
      :data="referenceOfDocuments"
      :row-key="record => record.id"
      style="border: 1px solid #DCDFE6; border-radius: 4px;"
    >
      <el-table-column
        prop="id"
        label="ID"
      >
        <template slot-scope="scope">
          <router-link :to="`/documents/${scope.row.id}`">
            {{ scope.row.id | shortDesc }}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="Identifier">
        <template slot-scope="scope">
          <span v-if="scope.row.data.name">
            {{ scope.row.data.name }}
          </span>
          <span v-else-if="scope.row.data.title">
            {{ scope.row.data.title }}
          </span>
          <span v-else-if="scope.row.data.identifier">
            {{ scope.row.data.identifier }}
          </span>
          <span
            v-else
            :title="JSON.stringify(scope.row.data)"
          >
            {{ JSON.stringify(scope.row.data).substr(0, 15) }}
          </span>
        </template>
      </el-table-column>
    </el-table>

    <el-row
      type="flex"
      justify="space-between"
    >
      <span />
      <el-pagination
        :current-page="page"
        class="dockite-element--pagination"
        :page-count="totalPages"
        :pager-count="5"
        :page-size="20"
        :total="totalItems"
        hide-on-single-page
        layout="total, prev, pager, next"
        @current-change="(newPage) => page = newPage"
      />
    </el-row>

    <p slot="extra">
      {{ fieldConfig.description }}
    </p>
  </el-form-item>
</template>

<script lang="ts">
import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
import gql from 'graphql-tag';
import { Field, Document } from '@dockite/types';

interface ManyReferences {
  results: Document[];
  totalItems: number;
  currentPage: number;
  hasNextPage: boolean;
  totalPages: number;
}

@Component({
  name: 'ReferenceOfFieldInputComponent',
})
export default class ReferenceOfFieldInputComponent extends Vue {
  @Prop({ required: true })
  readonly name!: string;

  @Prop({ required: true })
  readonly value!: null;

  @Prop({ required: true })
  readonly formData!: object;

  @Prop({ required: true })
  readonly fieldConfig!: Field;

  public rules: object[] = [];

  public referenceOfDocuments: Document[] = [];

  public page = 1;

  public perPage = 20;

  public totalItems = 1;

  public totalPages = 1;

  public async fetchReferenceOfDocuments(): Promise<void> {
    const { data } = await this.$apolloClient.query<{ referenceOfDocuments: ManyReferences }>({
      query: gql`
        query FindReferenceOfDocuments(
          $documentId: String!
          $schemaId: String!
          $fieldName: String!
          $page: Int! = 1
          $perPage: Int! = 20
        ) {
          referenceOfDocuments: resolveReferenceOf(
            documentId: $documentId
            schemaId: $schemaId
            fieldName: $fieldName
            page: $page
            perPage: $perPage
          ) {
            results {
              id
              data
              updatedAt
              schema {
                id
                name
              }
            }
            totalItems
            currentPage
            hasNextPage
            totalPages
          }
        }
      `,
      variables: {
        documentId: this.$route.params.id,
        schemaId: this.fieldConfig.settings.schemaId,
        fieldName: this.fieldConfig.settings.fieldName,
        page: this.page,
        perPage: this.perPage,
      },
    });

    this.referenceOfDocuments = data.referenceOfDocuments.results;
    this.totalItems = data.referenceOfDocuments.totalItems;
    this.totalPages = data.referenceOfDocuments.totalPages;
  }

  @Watch('page')
  handlePageChange(): void {
    this.fetchReferenceOfDocuments();
  }

  mounted(): void {
    this.fetchReferenceOfDocuments();
  }
}
</script>

<style lang="scss"></style>
