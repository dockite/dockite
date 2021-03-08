import { Portal } from 'portal-vue';
import { defineComponent, reactive, ref, watchEffect } from 'vue';
import { usePromise } from 'vue-composable';
import { useRoute, useRouter } from 'vue-router';

import { getHeaderActions } from './util';

import { getSingletonById } from '~/common/api';
import { DASHBOARD_HEADER_PORTAL_ACTIONS, DASHBOARD_HEADER_PORTAL_TITLE } from '~/common/constants';
import { DocumentFormComponent } from '~/components/Common/Document/Form';
import { useGraphQL } from '~/hooks';

export const SingletonFormPage = defineComponent({
  name: 'SingletonFormPage',

  setup: () => {
    const route = useRoute();

    const router = useRouter();

    const { exceptionHandler } = useGraphQL();

    const formData = reactive<Record<string, any>>({});

    const formErrors: Record<string, string> = reactive({});

    const error = ref<Error | null>(null);

    const singletonId = ref(route.params.singletonId as string);

    const singleton = usePromise(() => getSingletonById(singletonId.value));

    watchEffect(() => {
      if (route.params.singletonId && route.params.singletonId !== singletonId.value) {
        singletonId.value = route.params.singletonId as string;

        singleton.exec();
      }
    });

    watchEffect(() => {
      if (singleton.error.value) {
        error.value = exceptionHandler(singleton.error.value, router);
      }
    });

    return () => {
      if (singleton.loading.value) {
        return (
          <>
            <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>Fetching Singleton...</Portal>

            <div>Loading...</div>
          </>
        );
      }

      if (singleton.error.value) {
        return (
          <>
            <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>Error fetching Singleton!</Portal>

            <div>
              An error occurred while fetching the Singleton
              <pre>{JSON.stringify(error.value, null, 2)}</pre>
            </div>
          </>
        );
      }

      if (!singleton.result.value) {
        return <div>An unknown error is ocurring</div>;
      }

      return (
        <>
          <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>{singleton.result.value.title}</Portal>

          <Portal to={DASHBOARD_HEADER_PORTAL_ACTIONS}>
            {getHeaderActions(singleton.result.value)}
          </Portal>

          <DocumentFormComponent
            v-model={formData}
            document={singleton.result.value}
            schema={singleton.result.value}
            errors={formErrors}
          />
        </>
      );
    };
  },
});

export default SingletonFormPage;
