<template>
  <el-form-item :prop="name" :rules="rules" class="dockite-field-group">
    <el-collapse :value="expanded" class="border">
      <el-collapse-item :name="name">
        <div slot="title" class="w-full px-3">
          <span class="font-semibold">Group: {{ fieldConfig.title }}</span>
        </div>
        <div class="p-3">
          <template v-if="ready && fieldData !== null">
            <el-row
              v-if="
                repeatable &&
                  Array.isArray(fieldData) &&
                  fieldData.length < (settings.maxRows || Infinity)
              "
              type="flex"
              justify="center"
              class="pb-3"
            >
              <el-button circle size="small" @click.prevent="handleAddFieldBefore">
                <i class="el-icon-plus" />
              </el-button>
            </el-row>

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
                    class="dockite-field-group--item items-center border border-gray-500 border-dashed p-3 mb-3"
                  >
                    <div class="flex flex-col justify-center items-center px-3 text-xl">
                      <el-button
                        v-if="repeatable"
                        :disabled="itemIndex === 0"
                        class="dockite-group--movement-button"
                        type="text"
                        icon="el-icon-top"
                        @click.prevent="handleShiftFieldUp(itemIndex)"
                      />

                      <div class="item-handle cursor-pointer dockite-group--movement-button">
                        <i class="el-icon-hamburger" />
                      </div>

                      <el-button
                        v-if="repeatable"
                        :disabled="itemIndex === fieldData.length - 1"
                        class="dockite-group--movement-button"
                        type="text"
                        icon="el-icon-bottom"
                        @click.prevent="handleShiftFieldDown(itemIndex)"
                      />

                      <el-button
                        class="dockite-group--movement-button"
                        type="text"
                        title="Remove the current group item"
                        icon="el-icon-delete"
                        @click.prevent="handleRemoveField(itemIndex)"
                      />
                    </div>

                    <div class="flex-1 clearfix">
                      <div v-for="(field, fieldIndex) in fields" :key="fieldIndex" class="w-full">
                        <component
                          :is="$dockiteFieldManager[field.type].input"
                          v-if="$dockiteFieldManager[field.type].input && !field.settings.hidden"
                          v-model="fieldData[itemIndex][field.name]"
                          :name="`${name}.${itemIndex}.${field.name}`"
                          :field-config="field"
                          :form-data="formData"
                          :schema="schema"
                        />
                      </div>
                    </div>
                  </div>
                </transition-group>
              </vue-draggable>
            </template>

            <template v-else>
              <div class="dockite-field-group--item items-center mb-3">
                <div class="flex-1">
                  <div v-for="(field, index) in fields" :key="index">
                    <component
                      :is="$dockiteFieldManager[field.type].input"
                      v-if="$dockiteFieldManager[field.type].input && !field.settings.hidden"
                      v-model="fieldData[field.name]"
                      :name="`${name}.${field.name}`"
                      :field-config="field"
                      :form-data="formData"
                      :schema="schema"
                    />
                  </div>
                </div>
              </div>
            </template>
          </template>

          <el-row
            v-if="
              repeatable &&
                Array.isArray(fieldData) &&
                fieldData.length > 0 &&
                fieldData.length < (settings.maxRows || Infinity)
            "
            type="flex"
            justify="center"
          >
            <el-button circle size="small" @click.prevent="handleAddFieldAfter">
              <i class="el-icon-plus" />
            </el-button>
          </el-row>
        </div>
      </el-collapse-item>
    </el-collapse>
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

  public expanded = '';

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

  get fieldData(): Record<string, any> | Record<string, any>[] | null {
    return this.value;
  }

  set fieldData(value) {
    this.$emit('input', value);
  }

  get settings(): GroupFieldSettings {
    return this.fieldConfig.settings;
  }

  get repeatable(): boolean {
    return this.settings.repeatable ?? false;
  }

  beforeMount(): void {
    if (this.name === this.fieldConfig.name) {
      this.expanded = this.name;
    }

    if (this.value === null) {
      this.expanded = this.name;
    }

    this.initialiseFormData();

    this.$nextTick(() => {
      this.ready = true;
    });

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

  public initialiseFormData(): void {
    if (this.value === null) {
      if (!this.repeatable) {
        this.fieldData = cloneDeep(this.initialFieldData);
      } else {
        this.fieldData = new Array(this.settings.minRows ?? 0)
          .fill(0)
          .map(_ => cloneDeep(this.initialFieldData));
      }

      return;
    }

    if (this.repeatable) {
      if (!Array.isArray(this.value)) {
        this.fieldData = [{ ...cloneDeep(this.initialFieldData), ...this.value }];
      }

      if (Array.isArray(this.value)) {
        this.value.map(v => ({ ...cloneDeep(this.initialFieldData), ...v }));
      }
    }
  }

  public handleAddFieldBefore(): void {
    if (Array.isArray(this.fieldData)) {
      this.fieldData = [{ ...this.initialFieldData }, ...this.fieldData];
    }
  }

  public handleAddFieldAfter(): void {
    if (Array.isArray(this.fieldData)) {
      this.fieldData = [...this.fieldData, { ...this.initialFieldData }];
    }
  }

  public handleRemoveField(index: number): void {
    if (Array.isArray(this.fieldData)) {
      this.fieldData.splice(index, 1);
    }
  }

  public handleShiftFieldUp(index: number): void {
    if (Array.isArray(this.fieldData)) {
      if (index === 0) {
        return;
      }

      const [fieldItem] = this.fieldData.splice(index, 1);

      this.fieldData.splice(index - 1, 0, fieldItem);
    }
  }

  public handleShiftFieldDown(index: number): void {
    if (Array.isArray(this.fieldData)) {
      const [fieldItem] = this.fieldData.splice(index, 1);

      this.fieldData.splice(index + 1, 0, fieldItem);
    }
  }
}
</script>

<style lang="scss">
.dockite-field-group-fieldset {
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

  .el-form-item {
    margin-bottom: 1rem;
  }

  .el-collapse-item__header {
    background: rgba(237, 242, 247, 1);
  }

  .el-collapse-item__content {
    padding-bottom: 0;
  }

  .dockite-group--movement-button {
    display: block;

    margin: 0;
    padding: 3px;

    font-size: 1rem;
  }
}
</style>
