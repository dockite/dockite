<template>
  <fragment>
    <portal to="header">
      <h2>Create a new Schema</h2>
    </portal>

    <div v-loading="loading > 0" class="create-schema-page el-loading-parent__min-height">
      <el-steps :active="step" simple class="dockite-steps--create-schema" finish-status="success">
        <el-step title="Name" />
        <el-step title="Fields" />
        <el-step title="Settings" />
        <el-step title="Review" />
      </el-steps>

      <div class="dockite-schema--step-content">
        <step-one
          v-show="step === 0"
          ref="step-1"
          :name.sync="createSchemaForm.name"
          :title.sync="createSchemaForm.title"
          @next-step="stepForwards"
        />
        <step-two v-show="step === 1" ref="step-2" @field-data="handleFieldData" />
        <step-three
          v-show="step === 2"
          ref="step-3"
          v-model="createSchemaForm.settings"
          :schema="createSchemaForm"
        />
        <step-four v-show="step === 3" ref="step-4" v-bind="createSchemaForm" />
      </div>

      <div class="dockite-schema--stepper">
        <el-row type="flex" justify="space-between">
          <el-button @click="stepBackwards">Back</el-button>
          <el-button type="primary" @click="stepForwards">Next Step</el-button>
        </el-row>
      </div>
    </div>
  </fragment>
</template>

<script lang="ts">
import { Field } from '@dockite/database';
import { Component, Vue } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import Logo from '~/components/base/logo.vue';
import StepOne from '~/components/schemas/create/step-1.vue';
import StepTwo from '~/components/schemas/create/step-2.vue';
import StepThree from '~/components/schemas/create/step-3.vue';
import StepFour from '~/components/schemas/create/step-4.vue';
import * as auth from '~/store/auth';
import * as schema from '~/store/schema';

const MIN_STEP = 0;
const MAX_STEP = 3;

interface StepFormComponent extends Vue {
  submit(): Promise<void>;
}

interface CreateSchemaForm {
  name: string;
  title: string;
  fields: Omit<Field, 'id' | 'schemaId' | 'dockiteField' | 'schema'>[];
  groups: Record<string, string[]>;
  settings: Record<string, any>;
}

@Component({
  components: {
    Fragment,
    Logo,
    StepOne,
    StepTwo,
    StepThree,
    StepFour,
  },
})
export default class CreateSchemaPage extends Vue {
  public step = 0;

  public loading = 0;

  public createSchemaForm: CreateSchemaForm = {
    name: '',
    title: '',
    fields: [],
    groups: {},
    settings: {},
  };

  get user(): string {
    return this.$store.getters[`${auth.namespace}/fullName`];
  }

  public async stepForwards(): Promise<void> {
    if (this.step === MAX_STEP) {
      try {
        this.loading += 1;

        await this.$store.dispatch(
          `${schema.namespace}/createSchemaWithFields`,
          this.createSchemaForm,
        );

        this.$router.push('/schemas');
      } catch (err) {
        this.$message({
          message:
            'An error occurred and we were unable to create your Schema. Please try again later.',
          type: 'error',
        });

        console.log(err);
      } finally {
        this.loading -= 1;
      }
    } else {
      try {
        this.loading += 1;

        await (this.$refs[`step-${this.step + 1}`] as StepFormComponent).submit();

        this.step = Math.min(MAX_STEP, this.step + 1);
      } catch (err) {
        console.log(err);
      } finally {
        this.loading -= 1;
      }
    }
  }

  public stepBackwards(): void {
    this.step = Math.max(MIN_STEP, this.step - 1);
  }

  public handleFieldData(fieldData: Omit<CreateSchemaForm, 'name'>): void {
    this.createSchemaForm = {
      ...this.createSchemaForm,
      ...fieldData,
    };
  }
}
</script>

<style>
.create-schema-page {
  background: #ffffff;
  padding: 1rem;
}

.dockite-schema--step-content {
  padding: 1.5rem 0;
}

.dockite-steps--create-schema {
  background: #ffffff;
}
</style>
