import { ElMessage } from 'element-plus';
import { Portal } from 'portal-vue';
import { computed, defineComponent, ref, watch, watchEffect } from 'vue';
import { usePromiseLazy } from 'vue-composable';
import { useRoute, useRouter } from 'vue-router';

import { getSingletonById, restoreSingleton } from '~/common/api';
import { DASHBOARD_HEADER_PORTAL_TITLE } from '~/common/constants';
import { ApplicationError, ApplicationErrorCode } from '~/common/errors';
import { logE } from '~/common/logger';
import { RenderIfComponent } from '~/components/Common/RenderIf';
import { SpinnerComponent } from '~/components/Common/Spinner';

export const RestoreSingletonPage = defineComponent({
  name: 'RestoreSingletonPage',

  setup: () => {
    const route = useRoute();
    const router = useRouter();

    const delay = ref(3);

    const singletonId = computed(() => {
      if (route.params.singletonId && typeof route.params.singletonId === 'string') {
        return route.params.singletonId;
      }

      return null;
    });

    const deletedSingleton = usePromiseLazy(() => {
      if (singletonId.value) {
        return getSingletonById(singletonId.value, true);
      }

      return Promise.reject(new Error('A valid singletonId is required'));
    });

    const handleDecrementDelay = (): void => {
      if (delay.value > 0) {
        setTimeout(() => {
          delay.value -= 1;

          handleDecrementDelay();
        }, 1000);
      }
    };

    const handleRestoreSingleton = usePromiseLazy(async () => {
      try {
        if (singletonId.value && deletedSingleton.result.value) {
          const result = await restoreSingleton(deletedSingleton.result.value);

          if (!result) {
            throw new ApplicationError(
              `Unable to restore provided Singleton with ID: ${singletonId.value}`,
              ApplicationErrorCode.CANT_RESTORE_SINGLETON,
            );
          }

          ElMessage.success('Singleton was restored successfully!');

          router.push('/singletons');
        }
      } catch (err) {
        logE(err);

        if (err instanceof ApplicationError) {
          throw err;
        }

        throw new ApplicationError(
          'An unknown error occurred, please try again later.',
          ApplicationErrorCode.UNKNOWN_ERROR,
        );
      }
    });

    watchEffect(() => {
      if (singletonId.value) {
        // If the singleton isn't already loading and we don't already have a value for it
        if (!deletedSingleton.loading.value && !deletedSingleton.result.value) {
          deletedSingleton.exec();
        }

        // If we have a value for the singleton but it's not the same as the route param
        if (
          deletedSingleton.result.value &&
          deletedSingleton.result.value.id !== singletonId.value
        ) {
          deletedSingleton.exec();
        }
      }
    });

    watch(
      () => deletedSingleton.result.value,
      value => {
        if (value) {
          handleDecrementDelay();
        }
      },
    );

    return () => {
      return (
        <div v-loading={handleRestoreSingleton.loading.value} class="relative">
          <RenderIfComponent condition={!singletonId.value || deletedSingleton.loading.value}>
            <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>Fetching Singleton...</Portal>

            <div style={{ minHeight: '40vh' }}>
              <div class="el-loading-mask">
                <div class="el-loading-spinner">
                  <SpinnerComponent />

                  <p class="el-loading-text">Singleton is still loading, please wait...</p>
                </div>
              </div>
            </div>
          </RenderIfComponent>

          <RenderIfComponent condition={!!deletedSingleton.error.value}>
            <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>Error fetching Singleton!</Portal>

            <div>An error occurred while fetching the Singleton, please try again later.</div>
          </RenderIfComponent>

          <RenderIfComponent condition={deletedSingleton.result.value !== null}>
            <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>
              Confirmation of <u>{deletedSingleton.result.value?.title}</u> Restoration
            </Portal>

            <div>
              <h2 class="text-xl font-semibold pb-5">
                Are you sure you want to restore {deletedSingleton.result.value?.title}?
              </h2>

              <div class="flex justify-between items-center">
                <el-button type="text" onClick={() => router.back()}>
                  Go Back
                </el-button>

                <el-button
                  type="danger"
                  loading={delay.value > 0 || handleRestoreSingleton.loading.value}
                  onClick={() => handleRestoreSingleton.exec()}
                >
                  {delay.value > 0
                    ? `Available in ${delay.value} seconds...`
                    : `Restore ${deletedSingleton.result.value?.title}`}
                </el-button>
              </div>
            </div>
          </RenderIfComponent>
        </div>
      );
    };
  },
});

export default RestoreSingletonPage;
