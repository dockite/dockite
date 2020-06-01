<template>
  <div class="create-schema-step-1-component">
    <h3>First, lets give the Schema a name</h3>

    <p class="dockite-text--subtitle">
      The Schema name should be reflective of the type of content it should hold. An example of a
      good Schema name would be <strong>BlogPosts</strong> for a Schema that was going to hold all
      the blog posts for a particular backend.
    </p>

    <el-form
      ref="form"
      :model="stepOneForm"
      :rules="stepOneFormRules"
      @submit.native.prevent="handleNextStep"
    >
      <el-form-item label="Schema Name" style="margin-bottom: 1rem;" prop="schemaName">
        <el-input :value="value" autofocus="autofocus" @input="handleNameChange" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { Form } from 'element-ui';
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
  readonly value!: string;

  get user(): string {
    return this.$store.getters[`${auth.namespace}/fullName`];
  }

  get stepOneForm(): { schemaName: string } {
    const schemaName = this.value;

    return {
      schemaName,
    };
  }

  get stepOneFormRules(): object {
    const $t = this.$t.bind(this);

    return {
      schemaName: [
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

  public handleNameChange(value: string): void {
    this.$emit('input', value);
  }

  public handleNextStep(): void {
    this.$emit('next-step');
  }
}
</script>

<style>
.dockite-text--subtitle {
  border-left: 4px solid #eeeeee;
  padding-left: 0.5rem;
  color: rgba(0, 0, 0, 0.66);
  font-style: italic;
}
</style>
