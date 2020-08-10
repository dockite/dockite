<template>
  <el-form-item :prop="name" :rules="rules">
    <fieldset class="dockite-field-variant">
      <legend>{{ fieldConfig.title }}</legend>

      <template v-if="!selectedField">
        <p class="dockite-field-variant--prompt">
          Select a variant from the below options
        </p>
        <el-row type="flex">
          <el-button
            v-for="variant in variants"
            :key="variant.name"
            class="dockite-field-variant--option"
            @click="handleUpdateVariant(variant.name)"
          >
            <span style="display: block; padding-bottom: 0.33rem;">
              {{ variant.title }}
            </span>
            <el-tag size="mini" effect="plain" type="info"
              >{{ variant.name }}:{{ variant.type }}</el-tag
            >
          </el-button>
        </el-row>
      </template>

      <div v-else class="dockite-field-variant--item">
        <el-button
          type="text"
          class="dockite-field-variant--remove-item"
          title="Remove the current variant"
          @click.prevent="handleClearVariant"
        >
          <i class="el-icon-close" />
        </el-button>

        <component
          :is="$dockiteFieldManager[selectedField.type].input"
          v-model="fieldData[selectedField.name]"
          :name="`${name}.${selectedField.name}`"
          :schema="schema"
          :field-config="selectedField"
          :form-data="formData"
        />
      </div>
    </fieldset>
  </el-form-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Field, Schema } from '@dockite/types';

type UnpersistedField = Omit<Field, 'id' | 'schemaId' | 'dockiteField' | 'schema'>;

@Component({
  name: 'GroupFieldInputComponent',
})
export default class GroupFieldInputComponent extends Vue {
  @Prop({ required: true })
  readonly name!: string;

  @Prop({ required: true })
  readonly value!: Record<string, any> | null;

  @Prop({ required: true })
  readonly formData!: object;

  @Prop({ required: true })
  readonly fieldConfig!: Field;

  @Prop({ required: true })
  readonly schema!: Schema;

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
  height: 60px;
  // line-height: 30px;
  width: 25%;
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
