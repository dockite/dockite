<template>
  <a-drawer :width="400" title="Add Field" :visible="drawerVisible" @close="handleClose">
    <template v-if="!selectedField">
      <a-button
        v-for="field in availableFields"
        :key="field.id"
        size="large"
        class="add-field-selector-button"
        type="dashed"
        block
        @click.prevent="e => handleSelectField(e, field.type)"
      >
        <strong>{{ field.title }}</strong>
        {{ field.description }}
      </a-button>
    </template>
    <a-form-model
      v-else
      ref="form"
      :model="field"
      :rules="rules"
      @submit.native.prevent="handleSubmit"
    >
      <a-form-model-item label="Name" prop="name">
        <a-input v-model="field.name" />
        <p slot="extra">
          The identifier of the field, must be lowercase and may only contain alphanumeric
          characters, underscores and dashses.
        </p>
      </a-form-model-item>
      <a-form-model-item label="Title" prop="title">
        <a-input v-model="field.title" />
        <p slot="extra">
          The title of the field, this is its friendly name and will be displayed in forms.
        </p>
      </a-form-model-item>
      <a-form-model-item label="Description" prop="description">
        <a-input v-model="field.description" type="textarea" />
        <p slot="extra">
          The description of the field, this should help the user determine how to use it.
        </p>
      </a-form-model-item>
      <component
        :is="getSettingsComponent(selectedField)"
        v-if="getSettingsComponent(selectedField)"
        v-model="field.settings"
        :rules.sync="rules"
      />
      <a-form-model-item style="margin-top: 12px;">
        <a-button size="large" type="primary" block html-type="submit">Add Field</a-button>
      </a-form-model-item>
      <a-form-model-item style="margin-top: 12px;">
        <a-button size="large" type="link" block @click="selectedField = null">Cancel</a-button>
      </a-form-model-item>
    </a-form-model>
  </a-drawer>
</template>

<script lang="ts">
import { Field } from '@dockite/types';
import { gql } from 'apollo-boost';
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import { fieldManager } from '../../dockite';

@Component({
  apollo: {
    availableFields: gql`
      query GetAvailableFields {
        availableFields {
          type
          title
          description
          defaultOptions
        }
      }
    `,
  },
})
export class AddField extends Vue {
  @Prop({ type: Boolean, required: true })
  public visible!: boolean;

  @Prop({ type: Array, required: true })
  public fields!: Omit<Field, 'id' | 'schemaId' | 'dockiteField' | 'schema'>[];

  get drawerVisible() {
    return this.visible;
  }

  set drawerVisible(value) {
    this.$emit('update:visible', value);
  }

  public availableFields: object[] = [];

  public selectedField: string | null = null;

  public field: Omit<Field, 'id' | 'schemaId' | 'dockiteField' | 'schema'> = {
    ...this.initialFieldState,
  };

  public form = this.$form.createForm(this);

  public rules = {
    name: [
      {
        required: true,
        message: 'A field title is required',
        trigger: 'change',
      },
      {
        min: 5,
        max: 26,
        message: 'The field name must contain atleast 5 and no more than 26 characters',
        trigger: 'change',
      },
      {
        pattern: /^[a-z0-9\-_]+$/,
        message: 'The field name must only contain alphanumeric characters, dashes and underscores',
        trigger: 'change',
      },
      {
        message: 'The field name is already used, please use a unique identifier',
        validator: (_rule: never, value: string, callback: Function) => {
          if (this.fields.filter(field => field.name === value).length > 0) {
            return callback(false);
          }

          return callback();
        },
      },
    ],
    title: [
      {
        required: true,
        message: 'A field title is required',
        trigger: 'change',
      },
      {
        min: 5,
        max: 26,
        message: 'The field title must contain atleast 5 and no more than 26 characters',
        trigger: 'change',
      },
    ],
    description: [
      {
        min: 0,
        max: 255,
        message: 'The field description must contain at most 255 characters',
        trigger: 'change',
      },
    ],
  };

  get initialFieldState() {
    return {
      name: '',
      title: '',
      type: this.selectedField || '',
      description: '',
      settings: {},
    };
  }

  public handleSelectField(e: any, type: string) {
    e.target.blur();
    this.selectedField = type;
    this.field = { ...this.initialFieldState };
  }

  public handleClose() {
    this.drawerVisible = false;
    this.selectedField = null;
    this.field = { ...this.initialFieldState };
  }

  public async handleSubmit() {
    try {
      await new Promise((resolve, reject) =>
        (this.$refs.form as any).validate((valid: boolean) => (valid ? resolve() : reject())),
      );

      this.$emit('field:submit', this.field);
      this.selectedField = null;
      this.field = { ...this.initialFieldState };
    } catch {
      this.$message.error('There was an error creating your field.');
    }
  }

  public getSettingsComponent(type: string): Vue.Component | null {
    if (fieldManager[type]) {
      return fieldManager[type].settings;
    }

    return null;
  }

  @Watch('selectedField')
  public handleSelectedFieldChange() {
    if (this.selectedField !== null) {
      this.form = this.$form.createForm(this);
    } else {
      this.form = null;
    }
  }

  @Watch('field.name')
  public handleFieldNameChange() {
    this.field.name = String(this.field.name).toLowerCase();
  }
}

export default AddField;
</script>

<style lang="scss">
.ant-drawer-content-wrapper {
  width: 100%;

  @media screen and (min-width: 800px) {
    width: 33%;
  }
}
</style>
