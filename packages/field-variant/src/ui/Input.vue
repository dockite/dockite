<template>
  <el-form-item :prop="name" :rules="rules">
    <el-collapse :value="expanded" class="border">
      <el-collapse-item :name="name">
        <div slot="title" class="w-full px-3">
          <span class="font-semibold">
            Variant: {{ fieldConfig.title }}
            <template v-if="selectedField">- {{ selectedField.title }}</template>
          </span>
        </div>

        <div v-if="!selectedField" class="p-3">
          <p class="dockite-field-variant--prompt">
            Select a variant from the below options
          </p>
          <div class="flex flex-wrap items-stretch -mx-3">
            <div v-for="variant in variants" :key="variant.name" class="p-3 flex-grow w-1/3">
              <el-button
                class="dockite-field-variant--option"
                @click="handleUpdateVariant(variant.name)"
              >
                <span style="display: block; padding-bottom: 0.33rem;">
                  {{ variant.title }}
                </span>
                <el-tag size="mini" effect="plain" type="info"
                  >{{ variant.name }}:{{ variant.type }}
                </el-tag>
              </el-button>
            </div>
          </div>
        </div>

        <div v-else class="dockite-field-variant--item p-3 clearfix">
          <component
            :is="$dockiteFieldManager[selectedField.type].input"
            v-if="fieldData !== null && !selectedField.settings.hidden"
            v-model="fieldData[selectedField.name]"
            :name="`${name}.${selectedField.name}`"
            :schema="schema"
            :field-config="selectedField"
            :form-data="formData"
          />

          <div class="float-right">
            <el-button
              type="text"
              class=""
              title="Remove the current variant"
              @click.prevent="handleClearVariant"
            >
              Clear Variant
            </el-button>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </el-form-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Field, Schema } from '@dockite/types';

type UnpersistedField = Omit<Field, 'id' | 'schemaId' | 'dockiteField' | 'schema'>;

@Component({
  name: 'VariantFieldInputComponent',
})
export default class VariantFieldInputComponent extends Vue {
  @Prop({ required: true })
  readonly name!: string;

  @Prop({ required: true })
  readonly value!: Record<string, any> | null;

  @Prop({ required: true })
  readonly formData!: object;

  @Prop({ required: true })
  readonly fieldConfig!: Field;

  @Prop({ required: true, type: Object })
  readonly schema!: Schema;

  public expanded = '';

  public rules: object[] = [];

  public ready = false;

  get variants(): UnpersistedField[] {
    return this.fieldConfig.settings.children;
  }

  get selectedField(): UnpersistedField | null {
    if (this.fieldData) {
      const [key] = Object.keys(this.fieldData);

      return this.variants.find(variant => variant.name === key) ?? null;
    }

    return null;
  }

  get fieldData(): Record<string, any> | null {
    if (!this.value) {
      return null;
    }

    return this.value;
  }

  set fieldData(value: Record<string, any> | null) {
    this.$emit('input', value);
  }

  beforeMount(): void {
    if (!this.value) {
      this.expanded = this.name;
    }

    if (this.fieldConfig.settings.required) {
      this.rules.push(this.getRequiredRule());
    }
  }

  getRequiredRule(): object {
    return {
      required: true,
      message: `${this.fieldConfig.title} is required`,
      trigger: 'blur',
    };
  }

  public handleUpdateVariant(name: string): void {
    this.fieldData = {
      [name]: this.selectedField?.settings?.default ?? null,
    };

    this.$nextTick(() => {
      this.ready = true;
    });
  }

  public handleClearVariant() {
    this.fieldData = null;
  }
}
</script>

<style lang="scss">
.dockite-field-variant {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 1rem;

  legend {
    padding: 0 0.5rem;
  }
}

.dockite-field-variant--item {
  position: relative;
  // margin-top: -1.2rem;

  .el-form-item {
    margin-bottom: 22px !important;
  }
}

.dockite-field-variant--remove-item {
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

.dockite-field-variant--option {
  height: 100%;
  width: 100%;
  white-space: initial;
}

.dockite-field-variant--prompt {
  border-left: 2px solid #dcdfe6;
  background: lighten(#dcdfe6, 7%);
  color: rgba(0, 0, 0, 0.66);
  margin: 0;
  padding: 0.5rem 1rem;
  margin-bottom: 1rem;
}
</style>
