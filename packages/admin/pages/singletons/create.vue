<template>
  <fragment>
    <portal to="header">
      <h2>Create a new Singleton</h2>
    </portal>

    <div v-loading="loading > 0" class="create-singleton-page el-loading-parent__min-height">
      <el-steps
        :active="step"
        simple
        class="dockite-steps--create-singleton"
        finish-status="success"
      >
        <el-step title="Name" />
        <el-step title="Fields" />
        <el-step title="Settings" />
        <el-step title="Review" />
      </el-steps>

      <div class="dockite-singleton--step-content">
        <step-one
          v-show="step === 0"
          ref="step-1"
          :name.sync="createSingletonForm.name"
          :title.sync="createSingletonForm.title"
          @next-step="stepForwards"
        >
          <template slot="header">
            <h3>First, lets give the Singleton a name</h3>

            <p class="dockite-text--subtitle">
              The Singleton name should be reflective of the type of content it should hold. An
              example of a good Singleton name would be <strong>About Us</strong> for a Singleton
              that was going to hold the About Us page data.
            </p>
          </template>
        </step-one>

        <step-two v-show="step === 1" ref="step-2" @field-data="handleFieldData"> </step-two>

        <step-three
          v-show="step === 2"
          ref="step-3"
          v-model="createSingletonForm.settings"
          :schema="createSingletonForm"
        >
        </step-three>

        <step-four v-show="step === 3" ref="step-4" v-bind="createSingletonForm"> </step-four>
      </div>

      <div class="dockite-singleton--stepper">
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
import * as singleton from '~/store/singleton';

const MIN_STEP = 0;
const MAX_STEP = 3;

interface StepFormComponent extends Vue {
  submit(): Promise<void>;
}

interface CreateSingletonForm {
  name: string;
  title: string;
  fields: Omit<Field, 'id' | 'singletonId' | 'dockiteField' | 'schema'>[];
  groups: Record<string, string[]>;
  settings: Record<string, any>;
  data: Record<string, any>;
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
export default class CreateSingletonPage extends Vue {
  public step = 0;

  public loading = 0;

  public createSingletonForm: CreateSingletonForm = {
    name: '',
    title: '',
    fields: [],
    groups: {},
    settings: {},
    data: {},
  };

  get user(): string {
    return this.$store.getters[`${auth.namespace}/fullName`];
  }

  public async stepForwards(): Promise<void> {
    if (this.step === MAX_STEP) {
      try {
        this.loading += 1;

        await this.$store.dispatch(
          `${singleton.namespace}/createSingletonWithFields`,
          this.createSingletonForm,
        );

        this.$router.push('/singletons');
      } catch (err) {
        this.$message({
          message:
            'An error occurred and we were unable to create your Singleton. Please try again later.',
          type: 'error',
        });

        console.log(err);
      } finally {
        this.$nextTick(() => {
          this.loading -= 1;
        });
      }
    } else {
      try {
        this.loading += 1;

        await (this.$refs[`step-${this.step + 1}`] as StepFormComponent).submit();

        this.step = Math.min(MAX_STEP, this.step + 1);
      } catch (err) {
        console.log(err);
      } finally {
        this.$nextTick(() => {
          this.loading -= 1;
        });
      }
    }
  }

  public stepBackwards(): void {
    this.step = Math.max(MIN_STEP, this.step - 1);
  }

  public handleFieldData(fieldData: Omit<CreateSingletonForm, 'name'>): void {
    this.createSingletonForm = {
      ...this.createSingletonForm,
      ...fieldData,
    };
  }
}
</script>

<style>
.create-singleton-page {
  background: #ffffff;
  padding: 1rem;
}

.dockite-singleton--step-content {
  padding: 1.5rem 0;
}

.dockite-steps--create-singleton {
  background: #ffffff;
}
</style>
