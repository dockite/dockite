<template>
  <div class="add-field-component">
    <el-drawer
      :visible="field !== null"
      :destroy-on-close="true"
      size=""
      custom-class="dockite-edit-field--drawer"
      @close="handleClose"
    >
      <div class="dockite-drawer--body">
        <el-form
          v-if="field !== null"
          ref="form"
          :validate-on-rule-change="false"
          :model="field"
          :rules="editFieldFormRules"
          label-position="top"
          @submit.native.prevent="handleEditField"
        >
          <el-form-item label="Name" prop="name">
            <el-input ref="fieldName" v-model="field.name" />
            <small>
              The identifier of the field, must be lowercase and may only contain alphanumeric
              characters, underscores and dashses.
            </small>
          </el-form-item>

          <el-form-item label="Title" prop="title">
            <el-input v-model="field.title" />
            <small>
              The title of the field, this is its friendly name and will be displayed in forms.
            </small>
          </el-form-item>

          <el-form-item label="Description" prop="description">
            <el-input v-model="field.description" type="textarea" />
            <small>
              The description of the field, this should help the user determine how to use it.
            </small>
          </el-form-item>

          <template v-if="fieldType !== null">
            <component
              :is="$dockiteFieldManager[fieldType].settings"
              v-model="field.settings"
              :rules.sync="fieldSettingsRules"
              :fields="currentFields"
              :groups="groups"
              :schema="schema"
              :apollo-client="$apolloClient"
            />
          </template>

          <el-form-item>
            <el-button
              style="width: 100%"
              type="primary"
              html-type="submit"
              @click="handleEditField"
            >
              Update Field
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
  </div>
</template>

<script lang="ts">
import { Field, Schema } from '@dockite/database';
import { DockiteFieldStatic } from '@dockite/types';
import { Form } from 'element-ui';
import { TreeData } from 'element-ui/types/tree';
import { Component, Vue, Prop, Watch, Ref } from 'nuxt-property-decorator';

import * as data from '~/store/data';

type EditableField = Omit<Field, 'id' | 'schemaId' | 'dockiteField' | 'schema'>;
type NullableEditableField = EditableField | null;

interface FieldTreeData extends TreeData {
  dockite: Omit<Field, 'id' | 'schemaId' | 'dockiteField' | 'schema'>;
  children?: FieldTreeData[];
}

@Component
export default class EditFieldComponent extends Vue {
  @Prop()
  readonly visible!: boolean;

  @Prop({ required: true, type: Array })
  readonly currentFields!: EditableField[];

  @Prop({ required: true })
  readonly value!: FieldTreeData | null;

  @Prop({ required: true })
  readonly schema!: Schema;

  @Prop({ required: true })
  readonly groups!: Record<string, string[]>;

  @Ref()
  readonly form!: Form;

  public fieldSettingsRules: object = {};

  public fieldOldName = '';

  public field: NullableEditableField = null;

  get fieldType(): string | null {
    return this.field?.type ?? null;
  }

  get editFieldFormRules(): object {
    return {
      name: [
        {
          required: true,
          message: 'A field title is required',
          trigger: 'blur',
        },
        {
          min: 2,
          max: 26,
          message: 'The field name must contain atleast 2 and no more than 26 characters',
          trigger: 'blur',
        },
        {
          pattern: /^[_A-Za-z][_0-9A-Za-z]*$/,
          message: 'The field name must be a valid GraphQL name.',
          trigger: 'blur',
        },
        {
          message: 'The field name is already used, please use a unique identifier',
          validator: (_rule: never, value: string, cb: Function) => {
            const found = this.currentFields.some(field => {
              return field.name === value && field.name !== this.fieldOldName;
            });

            if (found) {
              return cb(new Error());
            }

            return cb();
          },
        },
      ],
      title: [
        {
          required: true,
          message: 'A field title is required',
          trigger: 'blur',
        },
        {
          min: 2,
          max: 26,
          message: 'The field title must contain atleast 2 and no more than 26 characters',
          trigger: 'blur',
        },
      ],
      description: [
        {
          min: 0,
          max: 255,
          message: 'The field description must contain at most 255 characters',
          trigger: 'blur',
        },
      ],
      settings: { ...this.fieldSettingsRules },
    };
  }

  public handleClose(): void {
    this.$emit('submit');
  }

  public async handleEditField(): Promise<void> {
    if (this.field === null) {
      return;
    }

    try {
      const valid = await this.form.validate();

      if (!valid) {
        throw new Error('Invalid form data');
      }

      this.$emit('input', {
        ...this.value,
        label: this.field.title,
        dockite: { ...this.field },
      });

      this.handleClose();
    } catch (err) {
      console.log(err);
    }
  }

  get availableFields(): DockiteFieldStatic[] {
    const state = this.$store.state[data.namespace] as data.DataState;

    return state.availableFields;
  }

  @Watch('value')
  handleValueChange(newVal: FieldTreeData | null, oldVal: FieldTreeData | null): void {
    if (oldVal === null && newVal !== null) {
      const { dockite } = newVal;
      this.fieldOldName = dockite.name;
      this.field = { ...dockite };
    }

    if (newVal === null) {
      this.field = null;
      this.fieldOldName = '';
    }
  }

  @Watch('availableFields', { immediate: true })
  handleAvailableFieldsChange(): void {
    if (this.availableFields.length === 0) {
      this.$store.dispatch(`${data.namespace}/fetchAvailableFields`);
    }
  }

  @Watch('field.name')
  handleFieldNameChange(): void {
    if (this.field !== null) {
      this.field.name = this.field.name.toLowerCase().trim();
    }
  }
}
</script>

<style lang="scss">
.dockite-edit-field--drawer {
  width: 100%;
  max-width: 400px;
}

.dockite-drawer--body {
  padding: 0 1.5rem;
}

.el-drawer__body {
  overflow-y: auto;
}

.el-form-item {
  margin-bottom: 1rem;
}

.el-form-item__content {
  small {
    display: block;
    padding-top: 0.5rem;
    line-height: 1.2;
  }
}

.el-form-item__error {
  position: initial;
}

.dockite-edit-field--fields-container {
  flex-direction: column;
  flex-wrap: wrap;

  .el-button + .el-button {
    margin-left: 0;
  }
}

.dockite-edit-field--button {
  height: 80px;
  width: 100%;
  margin-bottom: 1rem;

  span.dockite-edit-field--button-title {
    display: block;
    font-weight: bold;
    padding-bottom: 0.5rem;
  }

  white-space: normal;
}
</style>
