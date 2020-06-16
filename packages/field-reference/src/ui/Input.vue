<template>
  <el-form-item
    :label="fieldConfig.title"
    class="dockite-field-reference"
    :prop="name"
    :rules="rules"
  >
    <div
      v-if="fieldData"
      class="active-reference"
    >
      <div>
        <span>{{ schemaName }}</span>
        <p>
          {{ documentIdentifier }} -
          <small>
            {{ fieldData.id }}
          </small>
        </p>
      </div>
      <a
        class="dockite-field reference remove"
        @click.prevent="handleClearReference"
      >
        <i class="el-icon-close" />
      </a>
    </div>

    <div
      v-else
      class="dockite-field reference no-reference"
    >
      <a @click="dialogVisible = true">Select a Document</a>
    </div>

    <el-dialog
      custom-class="dockite-dialog--reference-selection"
      :visible="dialogVisible"
      title="Select a Document"
      @close="dialogVisible = false"
    >
      <el-table
        :data="documents"
        :row-key="record => record.id"
        :max-height="400"
      >
        <el-table-column
          label=""
          width="25"
        >
          <template slot-scope="scope">
            <input
              v-model="document"
              type="radio"
              :value="scope.row"
            >
          </template>
        </el-table-column>

        <el-table-column
          prop="id"
          label="ID"
        >
          <template slot-scope="scope">
            {{ scope.row.id | shortDesc }}
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
              :title="scope.row.data"
            >
              {{ JSON.stringify(scope.row.data).substr(0, 15) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="schema.name"
          label="Schema"
        />
      </el-table>
    </el-dialog>

    <div class="el-form-item__description">
      {{ fieldConfig.description }}
    </div>
  </el-form-item>
</template>

<script lang="ts">
import gql from 'graphql-tag';
import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
import { Field, Document, Schema } from '@dockite/types';

interface SchemaResults {
  results: Schema[];
}

interface ValueType {
  id: string;
  schemaId: string;
}

@Component({
  name: 'ReferenceFieldInputComponent',
})
export default class ReferenceFieldInputComponent extends Vue {
  @Prop({ required: true })
  readonly name!: string;

  @Prop({ required: true })
  readonly value!: ValueType | null;

  @Prop({ required: true })
  readonly formData!: object;

  @Prop({ required: true })
  readonly fieldConfig!: Field;

  public rules: object[] = [];

  public documents: Document[] = [];

  public document: Document | null = null;

  public dialogVisible = false;

  public page = 1;

  public perPage = 20;

  get fieldData(): ValueType | null {
    return this.value;
  }

  set fieldData(value: ValueType | null) {
    this.$emit('input', value);
  }

  get schemaName(): string | null {
    if (!this.document) {
      return null;
    }

    return this.document.schema.name;
  }

  get documentIdentifier(): string {
    if (!this.document) {
      return 'Unknown';
    }

    const { data } = this.document;

    if (data.name) {
      return data.name;
    }

    if (data.title) {
      return data.title;
    }

    if (data.identifier) {
      return data.identifier;
    }

    return data.id;
  }

  @Watch('fieldData', { immediate: true })
  handleFieldDataChange(): void {
    if (this.fieldData !== null) {
      this.getDocumentById();
    }
  }

  @Watch('document', { immediate: true })
  handleDocumentChange(): void {
    if (this.document !== null && this.document.id !== this.fieldData?.id) {
      this.fieldData = {
        id: this.document.id,
        schemaId: this.document.schema.id,
      };

      this.dialogVisible = false;
    }
  }

  beforeMount(): void {
    if (!this.fieldData) {
      this.findDocuments();
    }

    if (this.fieldConfig.settings.required) {
      this.rules.push(this.getRequiredRule);
    }
  }

  public getRequiredRule(): object {
    return {
      required: true,
      message: `${this.fieldConfig.title} is required`,
      trigger: 'blur',
    };
  }

  public async findDocuments(): Promise<void> {
    const { schemaIds } = this.fieldConfig.settings;
    const { page } = this;

    const { data } = await this.$apolloClient.query({
      query: gql`
        query FindDocumentsBySchemaIds($schemaIds: [String!], $page: Int = 1, $perPage: Int = 20) {
          findDocuments(schemaIds: $schemaIds, page: $page, perPage: $perPage) {
            results {
              id
              data
              updatedAt
              schema {
                id
                name
              }
            }
          }
        }
      `,
      variables: {
        schemaIds,
        page,
      },
    });

    this.documents = data.findDocuments.results;
  }

  public async getDocumentById(): Promise<void> {
    if (!this.fieldData) {
      return;
    }

    const { id } = this.fieldData;

    const { data } = await this.$apolloClient.query({
      query: gql`
        query GetReferenceDocumentById($id: String!) {
          getDocument(id: $id) {
            id
            data
            updatedAt
            schema {
              id
              name
            }
          }
        }
      `,

      variables: {
        id,
      },
    });

    this.document = data.getDocument;
  }

  public handleClearReference(): void {
    this.fieldData = null;

    this.page = 1;

    this.findDocuments();
  }
}
</script>

<style lang="scss">
.dockite-field-reference {
  .active-reference {
    line-height: 1;

    box-sizing: border-box;

    * {
      box-sizing: border-box;
    }

    display: flex;
    align-items: center;

    width: 100%;
    padding: 1rem;

    border: 1px solid #dcdfe6;
    border-radius: 4px;

    & > div {
      display: flex;
      flex-direction: column;

      flex-grow: 1;

      span {
        font-weight: bold;
      }

      p {
        margin: 0;
        padding: 0;

        small {
          color: rgba(0, 0, 0, 0.45);
          font-size: 0.875rem;
        }
      }
    }

    & > a {
      color: rgba(0, 0, 0, 0.65);

      &:hover {
        opacity: 0.75;
      }
    }
  }

  .no-reference {
    box-sizing: border-box;

    * {
      box-sizing: border-box;
    }

    a {
      border: 1px solid #dcdfe6;
      color: rgba(0, 0, 0, 0.65);
      border-radius: 4px;
      display: block;
      width: 100%;
      padding: 1rem;
      text-align: center;
      cursor: pointer;

      &:hover {
        opacity: 0.75;
        text-decoration: underline;
      }
    }
  }
}

.dockite-dialog--reference-selection {
  width: 80%;
  max-width: 650px;
}
</style>
