<template>
  <fragment>
    <el-form-item
      label="Validation Groups"
      prop="settings.validationGroups"
      :rules="validationGroupRules"
    >
      <div v-for="(group, index) in settings.validationGroups" :key="index" class="flex mb-2">
        <el-select v-model="settings.validationGroups[index]" class="w-full" multiple filterable>
          <el-option
            v-for="field in fieldsFlat"
            :key="field.name"
            :label="field.title"
            :value="field.name"
          >
            {{ field.title }}
          </el-option>
        </el-select>

        <span class="pl-3">
          <el-button
            :disabled="settings.validationGroups.length <= 1"
            type="text"
            class="text-red-400 hover:text-red-500"
            icon="el-icon-delete"
            @click="handleRemoveValidationGroup(index)"
          />
        </span>
      </div>

      <div class="text-center">
        <el-button
          class="text-center"
          size="small"
          circle
          icon="el-icon-plus"
          @click="handleAddValidationGroup"
        />
      </div>
    </el-form-item>
  </fragment>
</template>

<script lang="ts">
import { Fragment } from 'vue-fragment';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Field } from '@dockite/database';

import { UniqueFieldSettings } from '../types';
import { DockiteFieldUnique } from '..';

const FieldsToOmit = ['id', 'setDockiteField', 'dockiteField'] as const;

type BaseField = Omit<Field, typeof FieldsToOmit[number]>;

interface FieldKeyValue {
  name: string;
  title: string;
}

@Component({
  name: 'UniqueFieldSettingsComponent',
  components: {
    Fragment,
  },
})
export default class UniqueFieldSettingsComponent extends Vue {
  @Prop({ required: true })
  readonly value!: UniqueFieldSettings;

  @Prop({ required: true })
  readonly rules!: object;

  @Prop({ required: true, type: Array })
  readonly fields!: Field[];

  get fieldsFlat(): FieldKeyValue[] {
    return this.makeFieldsFlat(this.fields);
  }

  get settings(): UniqueFieldSettings {
    return this.value;
  }

  set settings(value: UniqueFieldSettings) {
    this.$emit('input', value);
  }

  get validationGroupRules(): Record<string, any> {
    return {
      type: 'array',
      required: true,
      defaultField: { type: 'array', required: true, min: 1 },
    };
  }

  public makeFieldsFlat(fields: BaseField[], parent: FieldKeyValue | null = null): FieldKeyValue[] {
    const fieldCollection: FieldKeyValue[] = [];

    fields.forEach(field => {
      let { name, title } = field;

      if (parent) {
        name = `${parent.name}.${name}`;
        title = `${parent.title} > ${title}`;
      }

      fieldCollection.push({ name, title });

      if (field.settings.children) {
        fieldCollection.push(...this.makeFieldsFlat(field.settings.children, { name, title }));
      }
    });

    return fieldCollection;
  }

  public handleAddValidationGroup(): void {
    this.settings.validationGroups.push([]);
  }

  public handleRemoveValidationGroup(index: number): void {
    this.settings.validationGroups.splice(index, 1);
  }

  beforeMount(): void {
    this.settings = { ...DockiteFieldUnique.defaultOptions, ...this.value };

    this.$nextTick(() => {
      if (this.settings.validationGroups && this.settings.validationGroups.length === 0) {
        this.settings.validationGroups.push([]);
      }
    });
  }
}
</script>

<style></style>
