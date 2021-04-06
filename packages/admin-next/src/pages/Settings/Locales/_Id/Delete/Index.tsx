import { ElMessage } from 'element-plus';
import { Portal } from 'portal-vue';
import { defineComponent, watch } from 'vue';
import { usePromise, usePromiseLazy } from 'vue-composable';
import { useRoute, useRouter } from 'vue-router';
import { fetchAllDocumentsWithPagination } from '~/common/api';
import { deleteLocale, getLocale } from '~/common/api/locales';
import { DASHBOARD_HEADER_PORTAL_TITLE } from '~/common/constants';
import { logE } from '~/common/logger';
import { useCountdownLazy, useState } from '~/hooks';
import { setLocale } from '~/mutations';
import { getRootLocale } from '~/utils';
import './Update.scss';


export const LocaleDeletePage = defineComponent({
  name: 'LocaleDeletePage',

  setup: () => {
    const router = useRouter();
    const route = useRoute();

    const state = useState();

    const locale = usePromise(() =>
      getLocale({
        id: route.params.localeId as string,
      }),
    );

    const allDocumentsForLocale = usePromise(() =>
      fetchAllDocumentsWithPagination({
        locale: route.params.localeId as string,
        page: 1,
        perPage: 1,
      }),
    );

    const { counterInSeconds, startCountdown } = useCountdownLazy(3000);

    const handleDeleteLocale = usePromiseLazy(async () => {
      try {
        if (locale.result.value) {
          if (state.locale.id === locale.result.value.id) {
            setLocale(getRootLocale());
          }

          const success = await deleteLocale(locale.result.value);

          if (!success) {
            throw new Error('Unable to delete locale');
          }

          ElMessage.success('Locale successfully deleted!');

          router.push('/');
        }
      } catch (err) {
        logE(err);

        ElMessage.error('An error occurred while attempting to delete the locale!');
      }
    });

    watch(
      () => locale.result.value,
      value => {
        if (value) {
          startCountdown();
        }
      },
    );

    return () => {
      return (
        <>
          <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>
            Delete {locale.result.value?.title ?? 'Unknown'} Locale
          </Portal>

          <div v-loading={handleDeleteLocale.loading.value}>
            <h2 class="text-xl font-semibold pb-5">
              Are you sure you want to delete the {locale.result.value?.title} locale?
            </h2>

            <p class="pb-5">
              If you delete the {locale.result.value?.title} locale, the{' '}
              {allDocumentsForLocale.result.value?.totalItems} document(s) associated with the
              Locale will also be deleted!
            </p>

            <div class="flex justify-between items-center">
              <el-button type="text" onClick={() => router.back()}>
                Go Back
              </el-button>

              <el-button
                type="danger"
                loading={counterInSeconds.value > 0 || handleDeleteLocale.loading.value}
                onClick={() => handleDeleteLocale.exec()}
              >
                {counterInSeconds.value > 0
                  ? `Available in ${counterInSeconds.value} seconds...`
                  : `Delete ${locale.result.value?.title}`}
              </el-button>
            </div>
          </div>
        </>
      );
    };
  },
});

export default LocaleDeletePage;
