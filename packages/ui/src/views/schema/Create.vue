<template>
  <div class="document-edit">
    <portal to="title">
      <a-row type="flex" align="middle" justify="space-between" class="title-row">
        <h1>
          Create Schema
        </h1>
        <a-select default-value="en-AU" class="locale-selector">
          <a-select-option value="en-AU" class="locale-selector">
            <vue-country-flag country="au" size="normal" style="transform: scale(0.4);" />
          </a-select-option>
        </a-select>
      </a-row>
    </portal>

    <a-modal
      :visible="!schemaNameEntered"
      title="Name schema"
      @ok="schemaNameEntered = schemaName.length > 0"
      @cancel="$router.push('/schema')"
    >
      <a-input v-model="schemaName" placeholder="Schema Name.." />
    </a-modal>

    <a-modal
      v-model="groupsModalVisible"
      title="Add Group"
      centered
      @ok="handleAddGroup"
      @cancel="groupName = ''"
    >
      <a-input
        v-if="groupsModalVisible"
        v-model="groupName"
        placeholder="Group name..."
        @keydown.enter.self="handleAddGroup"
      />
    </a-modal>

    <AddFieldModal
      :visible.sync="addFieldModalVisible"
      :fields="fields"
      @field:submit="handleFieldSubmit"
    />

    <a-row style="margin-bottom: 1rem;" type="flex" align="middle">
      <h2 v-if="schemaName !== ''">{{ schemaName }}</h2>
      <h2 v-else contenteditable="">Enter Schema Name..</h2>
    </a-row>

    <a-form
      v-if="!$apollo.loading"
      class="bg-white"
      layout="vertical"
      @submit.prevent="handleSubmit"
    >
      <a-tabs v-model="selectedGroup" class="form-tabs" :tab-bar-gutter="0" tab-position="top">
        <div slot="tabBarExtraContent">
          <a-button type="link" @click="handleShowGroupsModal">
            Add Group<a-icon type="plus" size="large" style="font-size: 1rem;" />
          </a-button>
        </div>
        <a-tab-pane
          v-for="group in Object.keys(groups)"
          :key="group"
          class="form-tab-pane"
          :tab="group"
        >
          <a-list
            size="small"
            item-layout="horizontal"
            :split="false"
            :data-source="fields.filter(filterBySelectedGroup)"
          >
            <a-list-item slot="renderItem" slot-scope="item, index" class="field-list-item">
              <h3 style="margin: 0;padding: 0;">{{ item.title }}</h3>
              <span slot="actions" class="field-list-item-type">
                {{ item.type }}
              </span>
              <a slot="actions" style="color:rgba(0,0,0,0.65);" @click="fields.splice(index, 1)">
                <a-icon type="cross" />
              </a>
            </a-list-item>
          </a-list>
          <a-button size="large" @click="handleShowAddFieldModal">
            Add Field
            <a-icon type="plus" />
          </a-button>
        </a-tab-pane>
      </a-tabs>

      <section class="form-submit-section">
        <a-button html-type="submit" type="primary" size="large">
          Create
        </a-button>
      </section>
    </a-form>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Field, SchemaType } from '@dockite/types';
import { omitBy } from 'lodash';
import VueCountryFlag from 'vue-country-flag';
import { Draggable, Container } from 'vue-smooth-dnd';
import { gql } from 'apollo-boost';
import AddFieldModal from '../../components/schema/AddField.vue';

type DockiteFormField = Omit<Field, 'schemaId' | 'dockiteField'>;

@Component({
  components: {
    VueCountryFlag,
    Container,
    Draggable,
    AddFieldModal,
  },
})
export class CreateSchemaPage extends Vue {
  public schemaName = '';

  public schemaNameEntered = false;

  public fields: Omit<Field, 'id' | 'schemaId' | 'dockiteField' | 'schema'>[] = [];

  public groups: Record<string, string[]> = {
    Default: [],
  };

  public selectedGroup: string = Object.keys(this.groups)[0];

  public groupsModalVisible = false;

  public addFieldModalVisible = false;

  public groupName = '';

  public handleAddGroup() {
    if (this.groups[this.groupName]) {
      this.$message.error('Group already exists');
    } else {
      Vue.set(this.groups, this.groupName, []);

      this.groupName = '';
      this.groupsModalVisible = false;
    }
  }

  public filterBySelectedGroup(
    field: Omit<Field, 'id' | 'schemaId' | 'dockiteField' | 'schema'>,
  ): boolean {
    return this.groups[this.selectedGroup].includes(field.name);
  }

  public handleShowGroupsModal(e: any) {
    e.target.blur();
    this.groupsModalVisible = true;
  }

  public handleShowAddFieldModal(e: any) {
    e.target.blur();
    this.addFieldModalVisible = true;
  }

  public handleFieldSubmit(field: Omit<Field, 'id' | 'schemaId' | 'dockiteField' | 'schema'>) {
    this.addFieldModalVisible = false;

    this.fields.push({
      ...field,
      settings: omitBy(field.settings, x => x === null),
    });

    this.groups[this.selectedGroup].push(field.name);
  }

  public async handleSubmit() {
    try {
      const { data } = await this.$apollo.mutate({
        mutation: gql`
          mutation CreateSchemaMutation(
            $name: String!
            $type: SchemaType!
            $groups: JSON!
            $settings: JSON!
          ) {
            createSchema(name: $name, type: $type, groups: $groups, settings: $settings) {
              id
            }
          }
        `,
        variables: {
          name: this.schemaName,
          type: SchemaType.Default,
          groups: this.groups,
          settings: {},
        },
      });

      const schemaId = data.createSchema?.id ?? '';

      const fieldMutations = this.fields.map(field =>
        this.$apollo.mutate({
          mutation: gql`
            mutation CreateSchemaField(
              $schemaId: String!
              $name: String!
              $type: String!
              $title: String!
              $description: String!
              $settings: JSON!
            ) {
              createField(
                schemaId: $schemaId
                name: $name
                type: $type
                title: $title
                description: $description
                settings: $settings
              ) {
                id
              }
            }
          `,
          variables: { schemaId, ...field },
        }),
      );

      await Promise.all(fieldMutations);

      this.$message.success('Schema created successfully!');
    } catch {
      this.$message.error('Unable to create schema!');
    }
  }
}

export default CreateSchemaPage;
</script>

<style lang="scss">
.form-tabs {
  .ant-tabs-tab {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    margin: 0;
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

.add-field-selector-button {
  padding: 15px 7px;
  height: auto;
  strong {
    display: block;
  }
}

.ant-form-item {
  margin-bottom: 0;
}

li.ant-list-item.field-list-item {
  border: 1px dashed #cccccc;
  padding: 15px 10px;
  border-radius: 7px;
  margin-bottom: 15px;

  .ant-list-item-action {
    li em {
      display: none;
    }
  }

  .field-list-item-type {
    padding: 3px 7px;
    border: 1px dashed #cccccc;
    border-radius: 7px;
  }
}
</style>
