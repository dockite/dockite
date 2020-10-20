<template>
  <fragment>
    <el-form-item label="Required">
      <el-switch v-model="settings.required" />

      <div class="el-form-item__description">
        Controls whether or not the field is required, if set to true the document will not be able
        to be saved without setting the field.
      </div>
    </el-form-item>

    <el-form-item label="Allow Multiple">
      <el-switch v-model="settings.multiple" />

      <div class="el-form-item__description">
        Whether to allow multiple items to be selected, if set to false only a single item can be
        selected.
      </div>
    </el-form-item>

    <el-form-item label="Options" :class="{ 'is-error': error !== '' }">
      <el-table
        style="border: 1px solid #dcdfe6; border-radius: 4px; margin-bottom: 0.5rem;"
        :data="tableData"
      >
        <el-table-column prop="key" label="Label" />
        <el-table-column prop="value" label="Value" />
        <el-table-column label="Action">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleRemoveOption(scope.$index)">
              <i class="el-icon-delete" />
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-input v-model="optionLabel" style="margin-bottom: 0.5rem" placeholder="Label" />
      <el-input v-model="optionValue" style="margin-bottom: 0.5rem" placeholder="Value" />
      <el-button style="margin-bottom: 0.5rem" @click.prevent="handleAddOption"
        >Add Option</el-button
      >

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

import { SelectFieldSettings } from '../types';
import { DockiteFieldSelect } from '..';

interface KV {
  key: string;
  value: string;
}

@Component({
  name: 'SelectFieldSettingsComponent',
  components: {
    Fragment,
  },
})
export default class SelectFieldSettingsComponent extends Vue {
  @Prop({ required: true })
  readonly value!: SelectFieldSettings;

  @Prop({ required: true })
  readonly rules!: object;

  public optionLabel = '';

  public optionValue = '';

  public error = '';

  get settings(): SelectFieldSettings {
    return this.value;
  }

  set settings(value: SelectFieldSettings) {
    this.$emit('input', value);
  }

  get tableData(): KV[] {
    if (!this.settings.options) {
      return [];
    }

    return this.settings.options.map(x => {
      return {
        key: x.label,
        value: x.value,
      };
    });
  }

  public handleAddOption(): void {
    this.error = '';

    if (this.settings.options.find(x => x.label === this.optionLabel)) {
      this.error = 'Label has already been used.';
      return;
    }

    if (this.optionLabel !== '' && this.optionValue !== '') {
      this.settings.options.push({
        label: this.optionLabel,
        value: this.optionValue,
      });

      this.optionLabel = '';
      this.optionValue = '';
    } else {
      this.error = 'Both option label and option value must be provided.';
    }
  }

  public handleRemoveOption(index: number): void {
    this.settings.options.splice(index, 1);
  }

  beforeMount(): void {
    this.settings = { ...DockiteFieldSelect.defaultOptions, ...this.settings };
  }
}
</script>

<style></style>
