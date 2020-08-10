<template>
  <fragment>
    <el-form-item label="Required">
      <el-switch v-model="settings.required" />

      <div class="el-form-item__description">
        Controls whether or not the field is required, if set to true the document will not be able
        to be saved without setting the field.
      </div>
    </el-form-item>

    <el-form-item class="overflow-x-auto" label="Options" :class="{ 'is-error': error !== '' }">
      <el-table
        style="border: 1px solid #dcdfe6; border-radius: 4px; margin-bottom: 0.5rem;"
        :data="tableData"
      >
        <el-table-column prop="key" label="Label" />
        <el-table-column prop="value" label="Value" />
        <el-table-column prop="fieldsToHide" label="Fields To Hide" />
        <el-table-column prop="groupsToHide" label="Groups To Hide" />
        <el-table-column label="Action">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleRemoveOption(scope.row.key)">
              <i class="el-icon-delete" />
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-input v-model="optionLabel" class="mb-2" placeholder="Label" />
      <el-input v-model="optionValue.value" class="mb-2" placeholder="Value" />
      <el-select
        v-model="optionValue.fieldsToHide"
        class="w-full mb-2"
        placeholder="Fields to Hide"
        multiple
        filterable
      >
        <el-option
          v-for="field in allFields"
          :key="field.name"
          :label="field.title"
          :value="field.name"
        />
      </el-select>
      <el-select
        v-model="optionValue.groupsToHide"
        class="w-full mb-2"
        placeholder="Groups to Hide"
        multiple
        filterable
      >
        <el-option v-for="group in allGroups" :key="group" :label="group" :value="group" />
      </el-select>
      <el-button class="mb-2" @click.prevent="handleAddOption">Add Option</el-button>

      <div class="el-form-item__description">
        The options to display in the select field.
      </div>

      <div v-if="error !== ''" class="el-form-item__error">
        {{ error }}
      </div>
    </el-form-item>
  </fragment>
</template>

<script lang="ts">
import { Fragment } from 'vue-fragment';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Field } from '@dockite/database';

import { ConditionalSelectFieldSettings, ConditionalSelectFieldOptionValue } from '../types';
import { DockiteFieldConditionalSelect } from '..';

interface KV {
  key: string;
  value: string | null;
  fieldsToHide: string;
  groupsToHide: string;
}

@Component({
  name: 'ConditionalSelectFieldSettingsComponent',
  components: {
    Fragment,
  },
})
export default class SelectFieldSettingsComponent extends Vue {
  @Prop({ required: true })
  readonly value!: ConditionalSelectFieldSettings;

  @Prop({ required: true })
  readonly rules!: object;

  @Prop({ required: true })
  readonly groups!: Record<string, string[]>;

  @Prop({ required: true })
  readonly fields!: Field[];

  public optionLabel = '';

  public optionValue: ConditionalSelectFieldOptionValue = {
    value: null,
    fieldsToHide: [],
    groupsToHide: [],
  };

  public error = '';

  get settings(): ConditionalSelectFieldSettings {
    return this.value;
  }

  set settings(value: ConditionalSelectFieldSettings) {
    this.$emit('input', value);
  }

  get allGroups(): string[] {
    return Object.keys(this.groups);
  }

  get allFields(): Field[] {
    const allFieldNames = Object.values(this.groups).reduce((acc, curr) => [...acc, ...curr], []);

    return this.fields.filter(field => allFieldNames.includes(field.name));
  }

  get tableData(): KV[] {
    if (!this.settings.options) {
      return [];
    }

    return Object.entries(this.settings.options).map(i => {
      const [key, value] = i;

      return {
        key,
        value: value.value,
        fieldsToHide: value.fieldsToHide.join(', '),
        groupsToHide: value.groupsToHide.join(', '),
      };
    });
  }

  public handleAddOption() {
    this.error = '';

    if (this.settings.options[this.optionLabel]) {
      this.error = 'Label has already been used.';
      return;
    }

    if (
      this.optionLabel !== '' &&
      this.optionValue.value &&
      (this.optionValue.fieldsToHide.length > 0 || this.optionValue.groupsToHide.length > 0)
    ) {
      this.settings = {
        ...this.settings,
        options: {
          ...this.settings.options,
          [this.optionLabel]: this.optionValue,
        },
      };

      this.optionLabel = '';
      this.optionValue = {
        value: null,
        fieldsToHide: [],
        groupsToHide: [],
      };
    } else {
      this.error = 'Both option label and option value must be provided.';
    }
  }

  public handleRemoveOption(label: string): void {
    Vue.delete(this.settings.options, label);
  }

  beforeMount() {
    if (Object.keys(this.settings).length === 0) {
      this.settings = { ...DockiteFieldConditionalSelect.defaultOptions };
    }
  }
}
</script>

<style></style>
