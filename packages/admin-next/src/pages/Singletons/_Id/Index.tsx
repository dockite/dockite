import { defineComponent, ref, watchEffect, reactive } from 'vue';
import { usePromise } from 'vue-composable';
import { useRoute, useRouter } from 'vue-router';

import { getSingletonById } from '~/common/api';
import { DASHBOARD_HEADER_PORTAL_TITLE } from '~/common/constants';
import { DocumentFormComponent } from '~/components/Common/Documents/Form';
import { useGraphQL, usePortal } from '~/hooks';

export const SingletonFormPage = defineComponent({
  name: 'SingletonFormPage',

  setup: () => {
    const route = useRoute();

    const router = useRouter();

    const { exceptionHandler } = useGraphQL();

    const { setPortal } = usePortal();

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
      if (singleton.loading.value) {
        setPortal(DASHBOARD_HEADER_PORTAL_TITLE, <span>Fetching Singleton...</span>);
      }

      if (singleton.error.value) {
        setPortal(DASHBOARD_HEADER_PORTAL_TITLE, <span>Error fetching Singleton!</span>);

        error.value = exceptionHandler(singleton.error.value, router);
      }

      if (singleton.result.value) {
        setPortal(DASHBOARD_HEADER_PORTAL_TITLE, <span>{singleton.result.value.title}</span>);
      }
    });

    return () => {
      if (singleton.loading.value) {
        return <div>Loading...</div>;
      }

      if (singleton.error.value) {
        return (
          <div>
            An error occurred while fetching the Singleton
            <pre>{JSON.stringify(error.value, null, 2)}</pre>
          </div>
        );
      }

      if (!singleton.result.value) {
        return <div>An unknown error is ocurring</div>;
      }

      return (
        <DocumentFormComponent
          v-model={formData}
          document={singleton.result.value}
          schema={singleton.result.value}
          errors={formErrors}
        />
      );
    };
  },
});

export default SingletonFormPage;
