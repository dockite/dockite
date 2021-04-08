import { ElMessage } from 'element-plus';
import { cloneDeep } from 'lodash';
import { Portal } from 'portal-vue';
import { Component, defineComponent, ref, watchEffect } from 'vue';
import { usePromise, usePromiseLazy } from 'vue-composable';
import { useRoute, useRouter } from 'vue-router';

import { Schema } from '@dockite/database';

import { getSchemaById, updateSchema } from '~/common/api';
import { DASHBOARD_HEADER_PORTAL_ACTIONS, DASHBOARD_HEADER_PORTAL_TITLE } from '~/common/constants';
import { ApplicationError } from '~/common/errors';
import {
  SchemaCreateFieldsStepComponent,
  SchemaCreateNameStepComponent,
  SchemaCreateReviewStepComponent,
  SchemaCreateSettingsStepComponent,
} from '~/components/Schemas/Create/Steps';

export const MAXIMUM_STEP = 3;

export const SchemaEditPage = defineComponent({
  name: 'SchemaEditPage',

  setup: () => {
    const route = useRoute();
    const router = useRouter();

    const activeStep = ref(0);

    const schema = ref<Schema | null>();

    const fetchedSchema = usePromise(() => getSchemaById(route.params.schemaId as string));

    const handleUpdateSchema = usePromiseLazy(
      async (): Promise<void> => {
        try {
          if (!schema.value) {
            throw new Error('');
          }

          const updatedSchema = await updateSchema(schema.value, route.params.schemaId as string);

          ElMessage.success('Successfully updated Schema!');

          router.push(`/schemas/${updatedSchema.id}`);
        } catch (err) {
          if (err instanceof ApplicationError) {
            ElMessage.error(err.message);
          }
        }
      },
    );

    watchEffect(() => {
      if (fetchedSchema.result.value) {
        if (!schema.value || schema.value.id !== fetchedSchema.result.value.id) {
          schema.value = cloneDeep(fetchedSchema.result.value);
        }
      }
    });

    const handleIncrementStep = (): void => {
      if (activeStep.value < MAXIMUM_STEP) {
        activeStep.value += 1;
      }
    };

    const handleDecrementStep = (): void => {
      if (activeStep.value > 0) {
        activeStep.value -= 1;
      }
    };

    const getActiveStepComponent = (): Component => {
      switch (activeStep.value) {
        case 0:
          return (
            <SchemaCreateNameStepComponent
              v-model={schema.value}
              updating
              {...{
                'onProgress:nextStep': () => handleIncrementStep(),
                'onProgress:previousStep': () => handleDecrementStep(),
              }}
            />
          );

        case 1:
          return (
            <SchemaCreateFieldsStepComponent
              v-model={schema.value}
              updating
              {...{
                'onProgress:nextStep': () => handleIncrementStep(),
                'onProgress:previousStep': () => handleDecrementStep(),
              }}
            />
          );

        case 2:
          return (
            <SchemaCreateSettingsStepComponent
              v-model={schema.value}
              updating
              {...{
                'onProgress:nextStep': () => handleIncrementStep(),
                'onProgress:previousStep': () => handleDecrementStep(),
              }}
            />
          );

        case 3:
          return (
            <SchemaCreateReviewStepComponent
              v-model={schema.value}
              updating
              {...{
                'onProgress:nextStep': () => handleIncrementStep(),
                'onProgress:previousStep': () => handleDecrementStep(),
                'onAction:updateSchema': () => handleUpdateSchema.exec(),
              }}
            />
          );

        default:
          return (
            <SchemaCreateNameStepComponent
              v-model={schema.value}
              updating
              {...{
                'onProgress:nextStep': () => handleIncrementStep(),
                'onProgress:previousStep': () => handleDecrementStep(),
              }}
            />
          );
      }
    };

    return () => {
      return (
        <>
          <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>Update {schema.value?.title}</Portal>

          <Portal to={DASHBOARD_HEADER_PORTAL_ACTIONS}>
            <el-button onClick={() => router.back()}>
              <i class="el-icon-back el-icon--left" />
              Back
            </el-button>
          </Portal>

          <div v-loading={handleUpdateSchema.loading.value || fetchedSchema.loading.value}>
            <div class="py-5 -mx-5">
              <el-steps active={activeStep.value} finishStatus="success" alignCenter>
                <el-step title="Name" description="Name your Schema" />
                <el-step title="Fields" description="Add the Fields" />
                <el-step title="Settings" description="Apply additional Settings" />
                <el-step title="Review" description="Review the Schema" />
              </el-steps>
            </div>

            {schema.value && getActiveStepComponent()}
          </div>
        </>
      );
    };
  },
});

export default SchemaEditPage;
