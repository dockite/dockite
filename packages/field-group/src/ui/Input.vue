<template>
  <el-form-item :prop="name" :rules="rules" class="dockite-field-group">
    <fieldset class="dockite-field-group">
      <legend>{{ fieldConfig.title }}</legend>
      <el-row type="flex" justify="center">
        <el-button v-if="repeatable && fieldData.length > 0" @click.prevent="handleAddFieldBefore">
          <i class="el-icon-plus" />
        </el-button>
      </el-row>
      <template v-if="ready">
        <template v-if="repeatable && Array.isArray(fieldData)">
          <vue-draggable
            v-model="fieldData"
            v-bind="dragOptions"
            handle=".item-handle"
            @start="drag = true"
            @end="drag = false"
          >
            <transition-group type="transition" :name="!drag ? 'flip-list' : null">
              <div
                v-for="(item, itemIndex) in fieldData"
                :key="itemIndex"
                class="dockite-field-group--item items-center"
              >
                <div class="pr-5 item-handle cursor-pointer">
                  <i class="el-icon-hamburger text-xl" />
                </div>

                <el-button
                  v-if="repeatable"
                  type="text"
                  class="dockite-field-group--remove-item"
                  title="Remove the current group item"
                  @click.prevent="handleRemoveField(itemIndex)"
                >
                  <i class="el-icon-close" />
                </el-button>
                <div class="flex-1">
                  <component
                    :is="$dockiteFieldManager[field.type].input"
                    v-for="(field, fieldIndex) in fields"
                    :key="fieldIndex"
                    v-model="fieldData[itemIndex][field.name]"
                    :name="`${name}[${itemIndex}].${field.name}`"
                    :field-config="field"
                    :form-data="formData"
                    :schema="schema"
                  />
                </div>
              </div>
            </transition-group>
          </vue-draggable>
        </template>
        <template v-else>
          <div class="dockite-field-group--item">
            <div class="flex-1">
              <component
                :is="$dockiteFieldManager[field.type].input"
                v-for="(field, index) in fields"
                :key="index"
                v-model="fieldData[field.name]"
                :name="`${name}.${field.name}`"
                :field-config="field"
                :form-data="formData"
                :schema="schema"
              />
            </div>
          </div>
        </template>
      </template>
      <el-row type="flex" justify="center">
        <el-button v-if="repeatable" @click.prevent="handleAddFieldAfter">
          <i class="el-icon-plus" />
        </el-button>
      </el-row>
    </fieldset>
  </el-form-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Field } from '@dockite/types';
import { Schema } from '@dockite/database';
import VueDraggable from 'vuedraggable';
import { cloneDeep } from 'lodash';

import { DockiteFieldGroupEntity, GroupFieldSettings } from '../types';

type UnpersistedField = Omit<Field, 'id' | 'schemaId' | 'dockiteField' | 'schema'>;

@Component({
  name: 'GroupFieldInputComponent',
  components: {
    VueDraggable,
  },
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

  @Prop({ required: true, type: Object })
  readonly schema!: Schema;

  public rules: object[] = [];

  public ready = false;

  public groupRules: Record<string, any> = {};

  public drag = false;

  public dragOptions = {
    animation: 200,
    disabled: false,
    ghostClass: 'ghost',
  };

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
      if (this.settings.minRows) {
        this.rules.push(this.getMinRule());
      }

      if (this.settings.maxRows) {
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
    return this.fields.reduce((a, b) => ({ ...a, [b.name]: b.settings.default ?? null }), {});
  }

  public initialiseForm(): void {
    if (this.repeatable && !Array.isArray(this.fieldData)) {
      if (this.fieldData !== null) {
        this.fieldData = [this.fieldData];
      } else if (this.settings.minRows && this.settings.minRows > 0) {
        this.fieldData = new Array(this.settings.minRows)
          .fill(0)
          .map(_ => cloneDeep(this.initialFieldData));
      } else {
        this.fieldData = [];
      }
    }

    if (this.repeatable && Array.isArray(this.fieldData)) {
      if (this.fieldData.length === 0) {
        this.fieldData = [];
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

  public handleAddFieldBefore(): void {
    if (Array.isArray(this.fieldData)) {
      this.fieldData.unshift({ ...this.initialFieldData });
    }
  }

  public handleAddFieldAfter(): void {
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
  display: flex;
  width: 100%;

  .el-form-item {
    margin-bottom: 22px !important;
  }
}

.dockite-field-group--remove-item {
  position: absolute;
  top: 10px;
  right: 10px;
  color: #f56c6c;
  z-index: 200;

  &:hover {
    color: #f56c6c;
    opacity: 0.75;
  }

  i {
    font-weight: bold;
  }
}

.dockite-field-group {
  .flip-list-move {
    transition: transform 0.5s;
  }
  .no-move {
    transition: transform 0s;
  }
}
</style>
