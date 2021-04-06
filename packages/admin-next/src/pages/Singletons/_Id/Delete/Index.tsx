import { ElMessage } from 'element-plus';
import { Portal } from 'portal-vue';
import { computed, defineComponent, watch, watchEffect } from 'vue';
import { usePromiseLazy } from 'vue-composable';
import { useRoute, useRouter } from 'vue-router';
import { deleteSingleton, getSingletonById } from '~/common/api';
import { DASHBOARD_HEADER_PORTAL_TITLE } from '~/common/constants';
import { ApplicationError, ApplicationErrorCode } from '~/common/errors';
import { logE } from '~/common/logger';
import { RenderIfComponent } from '~/components/Common/RenderIf';
import { SpinnerComponent } from '~/components/Common/Spinner';
import { useCountdownLazy } from '~/hooks';


export const DeleteSingletonPage = defineComponent({
  name: 'DeleteSingletonPage',

  setup: () => {
    const route = useRoute();
    const router = useRouter();

    const singletonId = computed(() => {
      if (route.params.singletonId && typeof route.params.singletonId === 'string') {
        return route.params.singletonId;
      }

      return null;
    });

    const singleton = usePromiseLazy(() => {
      if (singletonId.value) {
        return getSingletonById(singletonId.value);
      }

      return Promise.reject(new Error('A valid singletonId is required'));
    });

    const { counterInSeconds, startCountdown } = useCountdownLazy(3000);

    const handleDeleteSingleton = usePromiseLazy(async () => {
      try {
        if (singletonId.value && singleton.result.value) {
          const result = await deleteSingleton(singleton.result.value);

          if (!result) {
            throw new ApplicationError(
              `Unable to delete provided Singleton with ID: ${singletonId.value}`,
              ApplicationErrorCode.CANT_DELETE_SCHEMA,
            );
          }

          ElMessage.success('Singleton deleted successfully!');

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
        if (!singleton.loading.value && !singleton.result.value) {
          singleton.exec();
        }

        // If we have a value for the singleton but it's not the same as the route param
        if (singleton.result.value && singleton.result.value.id !== singletonId.value) {
          singleton.exec();
        }
      }
    });

    watch(
      () => singleton.result.value,
      value => {
        if (value) {
          startCountdown();
        }
      },
    );

    return () => {
      return (
        <div v-loading={handleDeleteSingleton.loading.value} class="relative">
          <RenderIfComponent condition={!singletonId.value || singleton.loading.value}>
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

          <RenderIfComponent condition={!!singleton.error.value}>
            <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>Error fetching Singleton!</Portal>

            <div>An error occurred while fetching the Singleton, please try again later.</div>
          </RenderIfComponent>

          <RenderIfComponent condition={singleton.result.value !== null}>
            <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>
              <span>
                Confirmation of <u>{singleton.result.value?.title}</u> Deletion
              </span>
            </Portal>

            <div>
              <h2 class="text-xl font-semibold pb-5">
                Are you sure you want to delete {singleton.result.value?.title}?
              </h2>

              <div class="flex justify-between items-center">
                <el-button type="text" onClick={() => router.back()}>
                  Go Back
                </el-button>

                <el-button
                  type="danger"
                  loading={counterInSeconds.value > 0 || handleDeleteSingleton.loading.value}
                  onClick={() => handleDeleteSingleton.exec()}
                >
                  {counterInSeconds.value > 0
                    ? `Available in ${counterInSeconds.value} seconds...`
                    : `Delete ${singleton.result.value?.title}`}
                </el-button>
              </div>
            </div>
          </RenderIfComponent>
        </div>
      );
    };
  },
});

export default DeleteSingletonPage;
