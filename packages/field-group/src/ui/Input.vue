<template>
  <el-form-item :prop="name" :rules="rules">
    <fieldset class="dockite-field-group">
      <legend>{{ fieldConfig.title }}</legend>
      <template v-if="ready">
        <template v-if="repeatable && Array.isArray(fieldData)">
          <div
            v-for="(item, itemIndex) in fieldData"
            :key="itemIndex"
            class="dockite-field-group--item"
          >
            <el-button
              v-if="repeatable"
              type="text"
              class="dockite-field-group--remove-item"
              title="Remove the current group item"
              @click.prevent="handleRemoveField(itemIndex)"
            >
              <i class="el-icon-close" />
            </el-button>
            <component
              :is="$dockiteFieldManager[field.type].input"
              v-for="(field, fieldIndex) in fields"
              :key="fieldIndex"
              v-model="fieldData[itemIndex][field.name]"
              :name="`${name}[${itemIndex}].${field.name}`"
              :field-config="field"
              :form-data="formData"
            />
          </div>
        </template>
        <template v-else>
          <div class="dockite-field-group--item">
            <component
              :is="$dockiteFieldManager[field.type].input"
              v-for="(field, index) in fields"
              :key="index"
              v-model="fieldData[field.name]"
              :name="`${name}.${field.name}`"
              :field-config="field"
              :form-data="formData"
            />
          </div>
        </template>
      </template>
      <el-row type="flex" justify="center">
        <el-button v-if="repeatable" @click.prevent="handleAddField">
          <i class="el-icon-plus" />
        </el-button>
      </el-row>
    </fieldset>
  </el-form-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Field } from '@dockite/types';

import { DockiteFieldGroupEntity, GroupFieldSettings } from '../types';

type UnpersistedField = Omit<Field, 'id' | 'schemaId' | 'dockiteField' | 'schema'>;

@Component({
  name: 'GroupFieldInputComponent',
})
export default class GroupFieldInputComponent extends Vue {
  @Prop({ required: true })
  readonly name!: string;

  @Prop({ required: true })
  readonly value!: Record<string, any> | Record<string, any>[] | null;

  @Prop({ required: true })
  readonly formData!: object;

  @Prop({ required: true })
  readonly fieldConfig!: DockiteFieldGroupEntity;

  public rules: object[] = [];

  public ready = false;

  public groupRules: Record<string, any> = {};

  get fields(): UnpersistedField[] {
    return this.fieldConfig.settings.children;
  }

  get fieldData(): Record<string, any> | Record<string, any>[] {
    if (this.value !== null) {
      if (!Array.isArray(this.value) && this.repeatable) {
        return [this.value];
      }

      return this.value;
    }

    if (this.repeatable) {
      return [];
    }

    return {};
  }

  set fieldData(value: Record<string, any> | Record<string, any>[]) {
    this.$emit('input', value);
  }

  get settings(): GroupFieldSettings {
    return this.fieldConfig.settings;
  }

  get repeatable(): boolean {
    return this.settings.repeatable ?? false;
  }

  beforeMount(): void {
    if (this.value === null) {
      this.$emit('input', this.repeatable ? [] : {});
    }

    this.initialiseForm();
    this.ready = true;

    if (this.settings.required) {
      this.rules.push(this.getRequiredRule());
    }

    if (this.settings.repeatable) {
      if (this.settings.minRows > -Infinity) {
        this.rules.push(this.getMinRule());
      }

      if (this.settings.maxRows < Infinity) {
        this.rules.push(this.getMaxRule());
      }
    }
  }

  public getRequiredRule(): object {
    return {
      required: true,
      message: `${this.fieldConfig.title} is required`,
      trigger: 'blur',
    };
  }

  public getMinRule(): object {
    return {
      type: 'array',
      min: this.settings.minRows,
      message: `${this.fieldConfig.title} must contain at least ${this.settings.minRows} rows.`,
      trigger: 'blur',
    };
  }

  public getMaxRule(): object {
    return {
      type: 'array',
      max: this.settings.maxRows,
      message: `${this.fieldConfig.title} must contain at most ${this.settings.maxRows} rows.`,
      trigger: 'blur',
    };
  }

  get initialFieldData(): Record<string, null> {
    return this.fields.reduce((a, b) => ({ ...a, [b.name]: null }), {});
  }

  public initialiseForm(): void {
    if (this.repeatable && !Array.isArray(this.fieldData)) {
      if (this.fieldData !== null) {
        this.fieldData = [this.fieldData];
      } else {
        this.fieldData = [];
      }
    }

    if (this.repeatable && Array.isArray(this.fieldData)) {
      if (this.fieldData.length === 0) {
        this.fieldData = [{ ...this.initialFieldData }];
      } else {
        this.fieldData = this.fieldData.map(fd => ({ ...this.initialFieldData, ...fd }));
      }
    } else {
      this.fieldData = {
        ...this.initialFieldData,
        ...this.fieldData,
      };
    }
  }

  public handleAddField(): void {
    if (Array.isArray(this.fieldData)) {
      this.fieldData.push({ ...this.initialFieldData });
    }
  }

  public handleRemoveField(index: number): void {
    if (Array.isArray(this.fieldData)) {
      this.fieldData.splice(index, 1);
    }
  }
}
</script>

<style lang="scss">
.dockite-field-group {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 1rem;

  legend {
    padding: 0.5rem;
  }
}

.dockite-field-group--item {
  position: relative;

  .el-form-item {
    margin-bottom: 22px !important;
  }
}

.dockite-field-group--remove-item {
  position: absolute;
  top: 10px;
  right: 10px;
  color: #f56c6c;
  z-index: 9999;

  &:hover {
    color: #f56c6c;
    opacity: 0.75;
  }

  i {
    font-weight: bold;
  }
}
</style>
