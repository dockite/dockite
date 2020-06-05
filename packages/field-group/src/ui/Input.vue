<template>
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
            :name="field.name"
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
            :name="field.name"
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
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Field } from '@dockite/types';

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
  readonly fieldConfig!: Field;

  public ready = false;

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

  get repeatable(): boolean {
    return this.fieldConfig.settings.repeatable ?? false;
  }

  set fieldData(value: Record<string, any> | Record<string, any>[]) {
    this.$emit('input', value);
  }

  mounted(): void {
    if (this.value === null) {
      this.$emit('input', this.repeatable ? [] : {});
    }

    this.initialiseForm();
    this.ready = true;

    const rules = [];

    if (this.fieldConfig.settings.required) rules.push(this.getRequiredRule());

    this.$emit('update:rules', { [this.fieldConfig.name]: rules });
  }

  getRequiredRule(): object {
    return {
      required: true,
      message: `${this.fieldConfig.title} is required`,
      trigger: 'change',
    };
  }

  get initialFieldData(): Record<string, null> {
    return this.fields.reduce((a, b) => ({ ...a, [b.name]: null }), {});
  }

  public initialiseForm(): void {
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
}

.dockite-field-group--remove-item {
  position: absolute;
  top: 7px;
  right: 7px;
  color: #f56c6c;

  &:hover {
    color: #f56c6c;
    opacity: 0.75;
  }

  i {
    font-weight: bold;
  }
}
</style>
