<template>
  <div class="document-edit bg-white">
    <portal to="title">
      <a-row type="flex" align="middle" justify="space-between" class="title-row">
        <h1>
          {{ getSchema && getSchema.name ? `Create ${getSchema.name}` : 'Loading...' }}
        </h1>
        <a-select default-value="en-AU" class="locale-selector">
          <a-select-option value="en-AU" class="locale-selector">
            <vue-country-flag country="au" size="normal" style="transform: scale(0.4);" />
          </a-select-option>
        </a-select>
      </a-row>
    </portal>

    <a-form-model
      v-if="!$apollo.loading"
      ref="form"
      layout="vertical"
      :model="form"
      :rules="formRules"
      @submit.prevent="handleSubmit"
    >
      <a-tabs class="form-tabs" :tab-bar-gutter="0" tab-position="top">
        <a-tab-pane v-for="group in groups" :key="group" class="form-tab-pane" :tab="group">
          <template v-for="field in Object.keys(form)">
            <component
              :is="getInputField(field)"
              :key="field"
              v-model="form[field]"
              :name="field"
              :form-data="form"
              :field-config="getFieldByKey('name', field)"
              @update:rules="handleRulesMerge"
            />
          </template>
        </a-tab-pane>
      </a-tabs>
      <section class="form-submit-section">
        <a-button html-type="submit" type="primary" size="large">
          Create
        </a-button>
      </section>
    </a-form-model>
  </div>
</template>

<script lang="ts">
import { Schema } from '@dockite/types';
import { has } from 'lodash';
import VueCountryFlag from 'vue-country-flag';
import { Component, Vue, Watch } from 'vue-property-decorator';

import { DockiteFormField } from '../../common/types';
import { fieldManager } from '../../dockite';
import GetSchemaByName from '../../queries/GetSchemaByName.gql';
import { DocumentState } from '../../store/document/types';

@Component({
  components: {
    VueCountryFlag,
  },
  apollo: {
    getSchema: {
      query: GetSchemaByName,

      variables() {
        return {
          name: this.$route.params.schema,
        };
      },
    },
  },
})
export class CreateDocumentPage extends Vue {
  public getSchema!: Partial<Schema>;

  public form: Record<string, any> = {};

  public formRules: Record<string, object[]> = {};

  public groups: string[] = ['Default'];

  public getInputField(name: string) {
    const field = this.getFieldByKey('name', name);

    if (!field) {
      return null;
    }

    if (fieldManager[field.type]) {
      return fieldManager[field.type].input;
    }

    return null;
  }

  public getFieldByKey(key: keyof DockiteFormField, value: string): DockiteFormField | null {
    const found = this.fields.find(field => field[key] === value);

    if (found) {
      return found;
    }

    return null;
  }

  get fields(): DockiteFormField[] {
    if (this.getSchema?.fields) {
      return this.getSchema.fields;
    }

    return [];
  }

  public initialiseFields() {
    if (this.fields.length > 0) {
      this.fields.forEach(field => {
        if (!has(this.form, field.name)) {
          Vue.set(this.form, field.name, null);
        }
      });
    }
  }

  @Watch('fields')
  public handleFieldsUpdate() {
    this.initialiseFields();
  }

  public async handleSubmit() {
    try {
      if (!this.getSchema.id) return;

      await new Promise((resolve, reject) =>
        (this.$refs.form as any).validate((valid: boolean) => (valid ? resolve() : reject())),
      );

      await this.$store.dispatch('document/create', {
        schemaId: this.getSchema.id,
        data: this.form,
        locale: 'en-AU',
      });

      const { documentId } = this.$store.state.document as DocumentState;

      this.$message.success('Document created successfully!');
      this.$router.push(`/documents/${documentId}`);
    } catch {
      this.$message.error('Unable to create document!');
    }
  }

  public handleRulesMerge(rules: Record<string, object[]>): void {
    this.formRules = {
      ...this.formRules,
      ...rules,
    };
  }

  mounted() {
    this.initialiseFields();
  }
}

export default CreateDocumentPage;
</script>

<style lang="scss">
.form-tabs {
  .ant-tabs-tab {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }

  .ant-tabs-tab-active {
    background: mix(#1890ff, #ffffff, 10%);
  }

  .ant-form-item {
    margin-bottom: 0;
  }
}

.form-tab-pane {
  padding: 1rem;
}

.form-submit-section {
  display: flex;
  flex-direction: row-reverse;
  width: 100%;
  padding: 0 1rem 1rem 1rem;
}

.locale-selector {
  display: flex;
  align-items: center;

  .locale-name {
    padding-left: 0.75rem;
  }
}
</style>
