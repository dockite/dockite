<template>
  <div class="add-field-component">
    <el-drawer
      :visible="visible"
      :destroy-on-close="true"
      size=""
      custom-class="dockite-add-field--drawer"
      @close="handleClose"
    >
      <h2 slot="title">
        <span v-if="selectedField">Add a {{ selectedField.title }} field</span>
        <span v-else>Add a Field</span>
      </h2>

      <div class="dockite-drawer--body">
        <el-form
          v-if="fieldSelected"
          ref="form"
          :model="field"
          :validate-on-rule-change="false"
          :rules="addFieldFormRules"
          label-position="top"
          @submit.native.prevent="handleAddField"
        >
          <el-form-item label="Name" prop="name">
            <el-input ref="fieldName" v-model="field.name" />
            <small>
              The identifier for the field, must be a valid GraphQL field name.
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
              :schema="schema"
              :groups="groups"
            />
          </template>

          <el-form-item style="margin-bottom: 0.5rem;">
            <el-button
              style="width: 100%"
              type="primary"
              html-type="submit"
              @click="handleAddField"
            >
              Add Field
            </el-button>
          </el-form-item>

          <el-form-item style="margin-bottom: 0.5rem;">
            <el-button style="width: 100%" type="text" @click="handleCancelSelectField">
              Cancel
            </el-button>
          </el-form-item>
        </el-form>

        <el-row v-else type="flex" class="dockite-add-field--fields-container">
          <el-input ref="input" v-model="filter" class="mb-3" placeholder="Filter" clearable />

          <el-button
            v-for="field in filteredFields"
            :key="field.type"
            class="dockite-add-field--button"
            @click="handleSelectField(field.type)"
          >
            <span class="dockite-add-field--button-title">{{ field.title }}</span>

            {{ field.description }}
          </el-button>
        </el-row>
      </div>
    </el-drawer>
  </div>
</template>

<script lang="ts">
import { Schema } from '@dockite/database';
import { DockiteFieldStatic } from '@dockite/types';
import { Input, Form } from 'element-ui';
import { sortBy } from 'lodash';
import { Component, Vue, Prop, Watch, Ref } from 'nuxt-property-decorator';

import { UnpersistedField } from '../../common/types';

import * as data from '~/store/data';

@Component
export default class AddFieldComponent extends Vue {
  @Prop()
  readonly visible!: boolean;

  @Prop({ required: true, type: Array })
  readonly currentFields!: UnpersistedField[];

  @Prop({ required: true })
  readonly schema!: Schema;

  @Prop({ required: true })
  readonly groups!: Record<string, string[]>;

  @Ref()
  readonly form!: Form;

  @Ref()
  readonly input!: any;

  public fieldSelected = false;

  public fieldType: string | null = null;

  public fieldSettingsRules: object = {};

  public field: UnpersistedField = {
    ...this.initialFieldState,
  };

  public filter = '';

  public sortBy = sortBy;

  get initialFieldState(): UnpersistedField {
    return {
      name: '',
      title: '',
      type: this.fieldType ?? '',
      description: '',
      settings: {},
    };
  }

  get addFieldFormRules(): object {
    return {
      name: [
        {
          required: true,
          message: 'A field title is required',
          trigger: 'blur',
        },
        {
          min: 2,
          max: 40,
          message: 'The field name must contain atleast 2 and no more than 40 characters',
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
            if (this.currentFields.filter(field => field.name === value).length > 0) {
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
          max: 255,
          message: 'The field title must contain atleast 2 and no more than 255 characters',
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
    this.$emit('update:visible', false);

    this.handleCancelSelectField();
  }

  public async handleAddField(): Promise<void> {
    try {
      const valid = await this.form.validate();

      if (!valid) {
        throw new Error('Invalid form data');
      }

      this.$emit('add-field', this.field);

      this.handleClose();
    } catch (err) {
      console.log(err);
    }
  }

  get availableFields(): DockiteFieldStatic[] {
    const state = this.$store.state[data.namespace] as data.DataState;

    return state.availableFields;
  }

  get filteredFields(): DockiteFieldStatic[] {
    return sortBy(
      this.availableFields.filter(x => x.title.toLowerCase().includes(this.filter.toLowerCase())),
      'title',
    );
  }

  get selectedField(): DockiteFieldStatic | null {
    if (!this.fieldType) {
      return null;
    }

    return this.availableFields.find(field => field.type === this.fieldType) ?? null;
  }

  @Watch('availableFields', { immediate: true })
  handleAvailableFieldsChange(): void {
    if (this.availableFields.length === 0) {
      this.$store.dispatch(`${data.namespace}/fetchAvailableFields`);
    }
  }

  @Watch('field.name')
  handleFieldNameChange(): void {
    this.field.name = this.field.name.trim();
  }

  handleSelectField(type: string): void {
    this.fieldType = type;
    this.field = { ...this.initialFieldState };

    this.fieldSelected = true;

    this.$nextTick(() => {
      (this.$refs.fieldName as Input).focus();
    });
  }

  handleCancelSelectField(): void {
    this.fieldSelected = false;
    this.fieldType = null;
  }
}
</script>

<style lang="scss">
.dockite-add-field--drawer {
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

.dockite-add-field--fields-container {
  flex-direction: column;
  flex-wrap: wrap;

  .el-button + .el-button {
    margin-left: 0;
  }
}

.dockite-add-field--button {
  height: 80px;
  width: 100%;
  margin-bottom: 1rem;

  span.dockite-add-field--button-title {
    display: block;
    font-weight: bold;
    padding-bottom: 0.5rem;
  }

  white-space: normal;
}
</style>
