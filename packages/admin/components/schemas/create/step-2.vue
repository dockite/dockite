<template>
  <div class="create-schema-step-2-component">
    <slot name="header">
      <h3>Next, lets add some fields</h3>

      <p class="dockite-text--subtitle">
        Fields define what a schema can hold, you can add String fields for names and descriptions,
        Color fields for product colors and so forth. A schema can have as many fields as you desire
        however the more you add the harder it can be to manage later on.
      </p>
    </slot>

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
      :schema="schema"
      @add-field="handleAddField"
    />

    <edit-field
      :value="fieldToBeEdited"
      :current-fields="fieldDataFlat"
      @input="handleEditField"
      @submit="fieldToBeEdited = null"
    />
  </div>
</template>

<script lang="ts">
import { Schema } from '@dockite/database';
import { TreeNode } from 'element-ui/types/tree';
import { Component, Vue, Prop } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import { FieldTreeData, UnpersistedField } from '~/common/types';
import Logo from '~/components/base/logo.vue';
import AddField from '~/components/fields/add-field.vue';
import EditField from '~/components/fields/edit-field.vue';
import * as auth from '~/store/auth';

const ALLOWED_DROP_TYPES = ['group', 'variant', 'string'];

@Component({
  components: {
    Fragment,
    Logo,
    AddField,
    EditField,
  },
})
export default class CreateSchemaStepTwoComponent extends Vue {
  @Prop()
  readonly value!: string;

  @Prop()
  readonly schema!: Schema;

  public showAddField = false;

  public currentTab = 'Default';

  public fieldToBeEdited: UnpersistedField | null = null;

  get availableTabs(): string[] {
    return Object.keys(this.groupFieldData);
  }

  get fieldData(): FieldTreeData[] {
    return this.groupFieldData[this.currentTab];
  }

  get user(): string {
    return this.$store.getters[`${auth.namespace}/fullName`];
  }

  public groupFieldData: Record<string, FieldTreeData[]> = {
    Default: [],
  };

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

  public submit(): void {
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

    this.$emit('field-data', { groups, fields: fieldData });
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

    children.splice(index, 1);
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
    return ALLOWED_DROP_TYPES.includes(dropNode.data.dockite.type);
  }

  public handleNextStep(): void {
    this.$emit('next-step');
  }

  public handleEditField(value: FieldTreeData): void {
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
}
</script>

<style lang="scss">
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
