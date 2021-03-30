import { ElMessage } from 'element-plus';
import { Portal } from 'portal-vue';
import { defineComponent, reactive, ref, watch } from 'vue';
import { usePromise, usePromiseLazy } from 'vue-composable';
import { useRoute, useRouter } from 'vue-router';

import { Locale } from '@dockite/database';

import { updateLocaleFormRules } from './formRules';

import { getLocale, updateLocale } from '~/common/api/locales';
import {
  DASHBOARD_HEADER_PORTAL_ACTIONS,
  DASHBOARD_HEADER_PORTAL_TITLE,
  DASHBOARD_MAIN_PORTAL_FOOTER,
  WORLD_FLAGS,
} from '~/common/constants';
import { logE } from '~/common/logger';
import { setLocale } from '~/mutations';
import './Update.scss';
import { isRootLocale } from '~/utils';

export const LocaleUpdatePage = defineComponent({
  name: 'LocaleUpdatePage',

  setup: () => {
    const router = useRouter();

    const route = useRoute();

    const locale = reactive<Locale>({
      id: '',
      title: '',
      icon: '',
    });

    const fetchedLocale = usePromise(() =>
      getLocale({
        id: route.params.localeId as string,
      }),
    );

    watch(fetchedLocale.result, result => {
      if (result) {
        Object.assign(locale, { ...result });
      }
    });

    const formRef = ref<any | null>(null);

    const handleUpdateLocale = usePromiseLazy(async () => {
      try {
        if (formRef.value) {
          const valid = await formRef.value.validate().catch(() => false);

          if (!valid) {
            return;
          }

          const lcl = await updateLocale(locale);

          ElMessage.success('Locale successfully updated!');

          setLocale(lcl);

          router.push('/');
        }
      } catch (err) {
        logE(err);

        ElMessage.error('An error occurred while attempting to update the locale!');
      }
    });

    return () => {
      return (
        <>
          <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>Update {locale.title}</Portal>

          <Portal to={DASHBOARD_HEADER_PORTAL_ACTIONS}>
            <el-button loading={handleUpdateLocale.loading.value} onClick={handleUpdateLocale.exec}>
              Update Locale
            </el-button>
          </Portal>

          <div v-loading={handleUpdateLocale.loading.value}>
            <el-form ref={formRef} model={locale} rules={updateLocaleFormRules}>
              <el-form-item label="ID" prop="id">
                <el-input disabled={true} value={locale.id} />

                <div class="el-form-item__description">
                  The canonical identifier for the locale, typically in the form of a country code.
                  e.g. en-AU
                </div>
              </el-form-item>

              <el-form-item label="Title" prop="title">
                <el-input disabled={isRootLocale(locale)} v-model={locale.title} />

                <div class="el-form-item__description">
                  The friendly title for the locale, typically the locales name. e.g. Australia
                </div>
              </el-form-item>

              <el-form-item label="Icon" prop="icon">
                <div class="border border-dashed rounded p-3 mt-10">
                  <el-input disabled={isRootLocale(locale)} v-model={locale.icon} />

                  <span class="line-around py-5 text-lg">OR</span>

                  <el-select
                    disabled={isRootLocale(locale)}
                    v-model={locale.icon}
                    class="w-full"
                    filterable
                  >
                    {WORLD_FLAGS.map(flag => (
                      <el-option
                        label={`${flag.emoji} ${flag.name}`}
                        value={flag.emoji}
                        onClick={() => {
                          if (!locale.title) {
                            locale.title = flag.name;
                          }
                        }}
                      >
                        <span class="pr-3">{flag.emoji}</span>
                        {flag.name}
                      </el-option>
                    ))}
                  </el-select>
                </div>

                <div class="el-form-item__description">
                  The icon to be displayed for the locale, accepts a base64 string or emoji.
                </div>
              </el-form-item>
            </el-form>
          </div>

          <Portal to={DASHBOARD_MAIN_PORTAL_FOOTER}>
            <div class="flex justify-between items-center pt-3">
              <el-button type="text" onClick={() => router.back()}>
                Go Back
              </el-button>
            </div>
          </Portal>
        </>
      );
    };
  },
});

export default LocaleUpdatePage;
