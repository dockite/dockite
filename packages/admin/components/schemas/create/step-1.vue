<template>
  <div class="create-schema-step-1-component">
    <slot name="header">
      <h3>First, lets give the Schema a name</h3>

      <p class="dockite-text--subtitle">
        The Schema name should be reflective of the type of content it should hold. An example of a
        good Schema name would be <strong>BlogPosts</strong> for a Schema that was going to hold all
        the blog posts for a particular backend.
      </p>
    </slot>

    <el-form
      ref="form"
      label-position="top"
      :model="stepOneForm"
      :rules="stepOneFormRules"
      @submit.native.prevent="handleNextStep"
    >
      <el-form-item label="Schema Title" style="margin-bottom: 1rem;" prop="schemaName">
        <el-input v-model="syncTitle" autofocus="autofocus" />
      </el-form-item>
      <el-form-item label="Schema Name" style="margin-bottom: 1rem;" prop="schemaName">
        <el-input v-model="syncName" :disabled="!overrideSchemaName" />
        <small>
          The schema name determines the name of the generated GraphQL type. For most purposes the
          generated name is fine but you can override it to meet your needs.
        </small>
      </el-form-item>
      <el-form-item label="Override Schema Name" style="margin-bottom: 1rem;">
        <el-switch v-model="overrideSchemaName" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { Form } from 'element-ui';
import { startCase } from 'lodash';
import { Component, Vue, Prop } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import Logo from '~/components/base/logo.vue';
import * as auth from '~/store/auth';

const SCHEMA_NAME_MAX_LEN = 26;

@Component({
  components: {
    Fragment,
    Logo,
  },
})
export default class CreateSchemaStepOneComponent extends Vue {
  @Prop()
  readonly name!: string;

  @Prop()
  readonly title!: string;

  public overrideSchemaName = false;

  get user(): string {
    return this.$store.getters[`${auth.namespace}/fullName`];
  }

  get syncTitle(): string {
    return this.title;
  }

  set syncTitle(value: string) {
    this.$emit('update:title', value);

    if (!this.overrideSchemaName) {
      this.syncName = this.graphqlCase(value);
    }
  }

  get syncName(): string {
    return this.name;
  }

  set syncName(value: string) {
    this.$emit('update:name', value);
  }

  get stepOneForm(): { name: string; title: string } {
    return {
      name: this.name,
      title: this.title,
    };
  }

  get stepOneFormRules(): object {
    const $t = this.$t.bind(this);

    return {
      name: [
        {
          required: true,
          message: $t('validationMessages.required', ['Schema Name']),
          trigger: 'blur',
        },
        {
          max: SCHEMA_NAME_MAX_LEN,
          message: $t('validationMessages.max.chars', [SCHEMA_NAME_MAX_LEN]),
          trigger: 'blur',
        },
        {
          pattern: /[A-Za-z][0-9A-Za-z\s]*/,
          message:
            'Schema Name must start with an alpha character and can only contain alpha-numeric characters and spaces.',
          trigger: 'blur',
        },
      ],
      title: [
        {
          required: true,
          message: $t('validationMessages.required', ['Schema Name']),
          trigger: 'blur',
        },
        {
          max: SCHEMA_NAME_MAX_LEN,
          message: $t('validationMessages.max.chars', [SCHEMA_NAME_MAX_LEN]),
          trigger: 'blur',
        },
        {
          pattern: /[A-Za-z][0-9A-Za-z\s]*/,
          message:
            'Schema Name must start with an alpha character and can only contain alpha-numeric characters and spaces.',
          trigger: 'blur',
        },
      ],
    };
  }

  public async submit(): Promise<void> {
    const valid = await (this.$refs.form as Form).validate();

    if (!valid) {
      throw new Error('Form is not valid');
    }
  }

  public handleNextStep(): void {
    this.$emit('next-step');
  }

  public graphqlCase(value: string): string {
    return startCase(value).replace(/\s/g, '');
  }
}
</script>

<style></style>
