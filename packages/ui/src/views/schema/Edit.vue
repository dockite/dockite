<template>
  <div v-if="!$apollo.loading" class="document-edit">
    <portal to="title">
      <a-row type="flex" align="middle" justify="space-between" class="title-row">
        <h1>Edit Schema - {{ getSchema.name }}</h1>
        <a-select default-value="en-AU" class="locale-selector">
          <a-select-option value="en-AU" class="locale-selector">
            <vue-country-flag country="au" size="normal" style="transform: scale(0.4);" />
          </a-select-option>
        </a-select>
      </a-row>
    </portal>

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
          v-for="(group, index) in Object.keys(groups)"
          :key="group"
          class="form-tab-pane"
        >
          <template slot="tab">
            {{ group }}
            <span
              v-if="index !== 0"
              style="font-size: 0.75rem; padding-left: 0.25rem; color: rgba(0,0,0, 0.50)"
              @click="handleGroupRemove(group)"
            >
              <a-icon style="margin: 0;" type="close"></a-icon>
            </span>
          </template>
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
              <a slot="actions" style="color:rgba(0,0,0,0.65);" @click="handleFieldRemove(index)">
                <a-icon type="close" />
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
          Update
        </a-button>
      </section>
    </a-form>
  </div>
</template>

<script lang="ts">
import { Schema } from '@dockite/types';
import { omitBy, union, cloneDeep } from 'lodash';
import VueCountryFlag from 'vue-country-flag';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { Draggable, Container } from 'vue-smooth-dnd';

import { DockiteFormField } from '../../common/types';
import AddFieldModal from '../../components/schema/AddField.vue';
import GetSchemaByName from '../../queries/GetSchemaByName.gql';

@Component({
  components: {
    AddFieldModal,
    Container,
    Draggable,
    VueCountryFlag,
  },
  apollo: {
    getSchema: {
      query: GetSchemaByName,
      variables() {
        return { name: this.$route.params.schema };
      },
    },
  },
})
export class EditSchemaPage extends Vue {
  public getSchema: Schema | null = null;

  public fields: DockiteFormField[] = [];

  public deletedFields: DockiteFormField[] = [];

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

  public filterBySelectedGroup(field: DockiteFormField): boolean {
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

  public handleFieldSubmit(field: DockiteFormField) {
    this.addFieldModalVisible = false;

    this.fields.push({
      ...field,
      settings: omitBy(field.settings, x => x === null),
    });

    this.groups[this.selectedGroup].push(field.name);
  }

  public handleFieldRemove(index: number): void {
    const deletedFields = this.fields.splice(index, 1);

    this.deletedFields.push(...deletedFields);

    Object.keys(this.groups).forEach(group => {
      this.groups[group] = this.groups[group].filter(
        field => !deletedFields.map(x => x.name).includes(field),
      );
    });
  }

  public handleGroupRemove(group: string): void {
    [this.selectedGroup] = Object.keys(this.groups);

    this.deletedFields.push(
      ...this.fields.filter(field => this.groups[group].includes(field.name) && field.id),
    );

    this.fields = this.fields.filter(field => !this.groups[group].includes(field.name));

    Vue.delete(this.groups, group);
  }

  public async handleSubmit(): Promise<void> {
    try {
      if (this.fields.length === 0) {
        this.$message.error('Cannot remove all fields from a Schema');
        return;
      }

      if (!this.getSchema || !this.getSchema.id) return;

      await this.$store.dispatch('schema/update', {
        id: this.getSchema.id,
        groups: this.groups,
        settings: {},
        fields: this.fields,
        deletedFields: this.deletedFields,
      });

      this.$message.success('Schema updated successfully!');
      this.$router.push('/schema');
    } catch (err) {
      this.$message.error('Unable to update schema!');
    }
  }

  @Watch('getSchema', { deep: true, immediate: true })
  public handleSchemaUpdate(): void {
    if (!this.getSchema) return;

    this.fields = union(this.fields, cloneDeep<DockiteFormField[]>(this.getSchema.fields));
    this.groups = { ...this.groups, ...cloneDeep<Record<string, string[]>>(this.getSchema.groups) };

    [this.selectedGroup] = Object.keys(this.groups);
  }
}

export default EditSchemaPage;
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
