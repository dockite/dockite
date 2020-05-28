<template>
  <fragment>
    <portal to="header">
      <h2>
        Edit Schema - <strong>{{ schemaName }}</strong>
      </h2>
    </portal>

    <div class="edit-schema-component">
      <el-tabs v-model="currentTab" type="border-card" editable @edit="handleEditTabs">
        <el-tab-pane v-for="tab in availableTabs" :key="tab" :label="tab" :name="tab">
          <el-tree
            :data="fieldData"
            empty-text="There's currently no fields"
            node-key="id"
            default-expand-all
            draggable
            :allow-drop="handleAllowDrop"
          >
            <span slot-scope="{ node, data }" class="dockite-tree--node">
              <span>{{ node.label }}</span>
              <span>
                <el-tag size="mini">
                  {{ data.dockite.type }}
                </el-tag>
                <el-button type="text" size="mini" @click="fieldToBeEdited = data">
                  Edit
                </el-button>
                <el-button type="text" size="mini" @click="handleRemoveField(node, data)">
                  Remove
                </el-button>
              </span>
            </span>
          </el-tree>

          <el-row type="flex" justify="center" style="margin-top: 1rem;">
            <el-button class="dockite-button--dashed" @click="showAddField = true">
              Add Field
              <i class="el-icon-plus"></i>
            </el-button>
          </el-row>
        </el-tab-pane>
      </el-tabs>

      <add-field
        :visible.sync="showAddField"
        :current-fields="fieldDataFlat"
        @add-field="handleAddField"
      />

      <edit-field
        :value="fieldToBeEdited"
        :current-fields="fieldDataFlat"
        @input="handleEditField"
        @submit="fieldToBeEdited = null"
      />

      <el-row type="flex" justify="space-between" style="margin-top: 1rem;">
        <el-button type="text" @click="$router.go(-1)">
          Cancel
        </el-button>

        <el-button type="primary" @click="submit">
          Update
        </el-button>
      </el-row>
    </div>
  </fragment>
</template>

<script lang="ts">
import { Schema, Field } from '@dockite/types';
import { TreeNode } from 'element-ui/types/tree';
import { cloneDeep, sortBy } from 'lodash';
import { Component, Vue, Watch } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import { UnpersistedField, FieldTreeData } from '../../../common/types';

import Logo from '~/components/base/logo.vue';
import AddField from '~/components/fields/add-field.vue';
import EditField from '~/components/fields/edit-field.vue';
import * as auth from '~/store/auth';
import * as data from '~/store/data';
import * as schema from '~/store/schema';

const ALLOWED_DROP_TYPES = ['group', 'variant', 'string'];

@Component({
  components: {
    Fragment,
    Logo,
    AddField,
    EditField,
  },
})
export default class EditSchemaPage extends Vue {
  public showAddField = false;

  public currentTab = 'Default';

  public fieldToBeEdited: UnpersistedField | null = null;

  public groupFieldData: Record<string, FieldTreeData[]> = {
    Default: [],
  };

  public deletedFields: string[] = [];

  get schemaName(): string {
    return this.$store.getters[`${data.namespace}/getSchemaNameById`](this.schemaId);
  }

  get schemaId(): string {
    return this.$route.params.id;
  }

  get availableTabs(): string[] {
    return Object.keys(this.groupFieldData);
  }

  get fieldData(): FieldTreeData[] {
    return this.groupFieldData[this.currentTab];
  }

  get schema(): Schema {
    return this.$store.getters[`${data.namespace}/getSchemaWithFieldsById`](this.$route.params.id);
  }

  get user(): string {
    return this.$store.getters[`${auth.namespace}/fullName`];
  }

  get fieldDataFlat(): UnpersistedField[] {
    const fieldData: UnpersistedField[] = [];

    Object.values(this.groupFieldData).forEach(groupFieldData => {
      fieldData.push(...this.getFieldDataFlat(groupFieldData));
    });

    return fieldData;
  }

  private getFieldDataFlat(fieldData: FieldTreeData[]): UnpersistedField[] {
    const data: UnpersistedField[] = [];

    fieldData.forEach(fd => {
      data.push(fd.dockite);

      if (fd.children && fd.children.length > 0) {
        data.push(...this.getFieldDataFlat(fd.children));
      }
    });

    return data;
  }

  public async submit(): Promise<void> {
    try {
      const fieldData: UnpersistedField[] = [];
      const groups: Record<string, string[]> = {};

      Object.keys(this.groupFieldData).forEach(group => {
        groups[group] = this.getFieldDataFlat(this.groupFieldData[group]).map(x => x.name);
        fieldData.push(...this.transformTreeFieldDataToFieldData(this.groupFieldData[group]));
      });

      if (fieldData.length === 0) {
        this.$message({
          message: 'A schema requires atleast one field.',
          type: 'error',
        });

        throw new Error('Schema requires fields');
      }

      if (Object.keys(this.groupFieldData).some(key => this.groupFieldData[key].length === 0)) {
        this.$message({
          message:
            'A group without fields exists. Please remove any groups that have no corresponding fields.',
          type: 'error',
        });

        throw new Error('Groups must have fields');
      }

      await this.$store.dispatch(`${schema.namespace}/updateSchemaAndFields`, {
        schema: {
          ...this.schema,
          groups,
        },
        fields: fieldData,
        deletedFields: this.deletedFields,
      });

      this.$message({
        message: 'Schema updated successfully',
        type: 'success',
      });

      this.$router.push(`/schemas/${this.$route.params.id}`);
    } catch (_) {}
  }

  public transformTreeFieldDataToFieldData(treeFieldData: FieldTreeData[]): UnpersistedField[] {
    const fieldData: UnpersistedField[] = [];

    treeFieldData.forEach(treeField => {
      if (treeField.children && treeField.children.length > 0) {
        treeField.dockite.settings.children = this.transformTreeFieldDataToFieldData(
          treeField.children,
        );
      }

      fieldData.push(treeField.dockite);
    });

    return fieldData;
  }

  private transformFieldsToFieldTreeData(fields: UnpersistedField[]): FieldTreeData[] {
    return fields.map(field => {
      const data: FieldTreeData = {
        label: field.name,
        dockite: field,
      };

      if (field.settings && field.settings.children) {
        data.children = this.transformFieldsToFieldTreeData(field.settings.children);
      }

      return data;
    });
  }

  public transformSchemaToFieldTreeData(): void {
    if (this.schema !== null) {
      Object.keys(this.schema.groups).forEach(group => {
        const fieldTreeData = this.transformFieldsToFieldTreeData(
          cloneDeep(
            this.schema.fields.filter(field => this.schema.groups[group].includes(field.name)),
          ),
        );

        const fieldTreeDataSorted = sortBy(fieldTreeData, [
          i => this.schema.groups[group].indexOf(i.dockite.name),
        ]);

        Vue.set(this.groupFieldData, group, fieldTreeDataSorted);
      });
    }
  }

  public handleRemoveField(node: TreeNode<string, FieldTreeData>, data: FieldTreeData): void {
    const parent = node.parent;

    if (!parent) {
      return;
    }

    const children = parent.data.children ?? ((parent.data as any) as FieldTreeData[]);

    if (!children) {
      return;
    }

    const index = children.findIndex(d => d.dockite.name === data.dockite.name);

    const [field] = children.splice(index, 1);

    if ((field.dockite as Field).id) {
      this.deletedFields.push((field.dockite as Field).id);
    }
  }

  public handleAddField(field: UnpersistedField): void {
    this.groupFieldData[this.currentTab].push({
      label: field.title,
      dockite: field,
    });
  }

  public handleAllowDrop(
    _draggingNode: TreeNode<string, FieldTreeData>,
    dropNode: TreeNode<string, FieldTreeData>,
    _type: 'prev' | 'inner' | 'next',
  ): boolean {
    return ALLOWED_DROP_TYPES.includes(dropNode.data.dockite.type ?? '');
  }

  public handleNextStep(): void {
    this.$emit('next-step');
  }

  public handleEditField(value: UnpersistedField): void {
    if (this.fieldToBeEdited !== null) {
      Object.assign(this.fieldToBeEdited, value);
    }
  }

  public async handleEditTabs(targetName: string, action: 'add' | 'remove'): Promise<void> {
    switch (action) {
      case 'add':
        try {
          const { value } = (await this.$prompt(
            'Please enter the name for the new tab:',
            'Tab Name',
            {
              confirmButtonText: 'OK',
              cancelButtonText: 'Cancel',
              inputPattern: /^[\w\s]+$/,
              inputValidator: (input: string) => {
                console.log(input);
                if (
                  Object.keys(this.groupFieldData)
                    .map(x => x.toLowerCase())
                    .includes(input.toLowerCase())
                ) {
                  return 'Group name has already been used';
                }

                if (!/^[\w\s]+$/.test(input)) {
                  return 'Group name must only contain words and spaces, no special characters are allowed.';
                }

                if (input.length === 0) {
                  return 'A group name is required';
                }

                return true;
              },
            },
          )) as { value: string };

          Vue.set(this.groupFieldData, value, []);
          this.currentTab = value;
        } catch {}
        break;

      case 'remove':
        if (this.availableTabs.length <= 1) {
          this.$message({
            message: "Can't remove the only tab",
            type: 'warning',
          });

          break;
        }

        Vue.delete(this.groupFieldData, targetName);

        if (this.currentTab === targetName) {
          this.currentTab = this.availableTabs[0];
        }
        break;
    }
  }

  @Watch('schema', { immediate: true })
  public handleSchemaChange(): void {
    if (this.schema !== null) {
      this.transformSchemaToFieldTreeData();
    }
  }

  public beforeMount(): void {
    this.$store.dispatch(`${data.namespace}/fetchSchemaWithFieldsById`, {
      id: this.$route.params.id,
    });
  }
}
</script>

<style lang="scss">
.dockite-text--subtitle {
  border-left: 4px solid #eeeeee;
  padding-left: 0.5rem;
  color: rgba(0, 0, 0, 0.66);
  font-style: italic;
}

.dockite-button--dashed {
  border-style: dashed;
}

.el-tabs--border-card {
  box-shadow: none;
}

.el-tabs__new-tab {
  margin-right: 10px;
}

.el-tabs__content {
  width: 100%;
  box-sizing: border-box;
}

.el-tree-node__content {
  border: 1px solid #eeeeee;
  height: 40px;
}

.dockite-tree--node {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 0.8rem;

  span:first-child {
    flex: 1;
  }

  .el-button + .el-button {
    margin-left: 0;
  }
}
</style>