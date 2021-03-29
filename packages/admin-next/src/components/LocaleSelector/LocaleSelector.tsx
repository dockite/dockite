import { computed, defineComponent, ref, watch } from 'vue';
import { usePromise } from 'vue-composable';
import { useRoute, useRouter } from 'vue-router';

import { Locale } from '@dockite/database';

import { LocaleIconComponent } from './LocaleIcon';

import { fetchAllLocales } from '~/common/api/locales';
import { CREATE_LOCALE_EVENT, DELETE_LOCALE_EVENT, UPDATE_LOCALE_EVENT } from '~/common/events';
import { useEvent, useState } from '~/hooks';
import { setLocale } from '~/mutations';

export const LocaleSelectorComponent = defineComponent({
  name: 'LocaleSelectorComponent',

  setup: () => {
    const state = useState();

    const route = useRoute();
    const router = useRouter();

    const popoverRef = ref<any | null>(null);

    const { onAll } = useEvent();

    const locales = usePromise(() => fetchAllLocales());

    const locale = computed<Locale>(() => {
      if (locales.result.value) {
        if (route.query.locale && typeof route.query.locale === 'string') {
          const localeQueryParam = route.query.locale;

          const match = locales.result.value.find(
            l => l.id === localeQueryParam || l.title === localeQueryParam,
          );

          if (match) {
            return match;
          }
        }
      }

      return state.locale;
    });

    const handleSetLocale = (locale: Locale): void => {
      setLocale(locale);

      router.replace({ query: { ...route.query, locale: locale.id } });

      if (popoverRef.value) {
        popoverRef.value.hide();
      }
    };

    watch(locale, value => {
      if (state.locale.id !== value.id) {
        setLocale(value);
      }
    });

    onAll([CREATE_LOCALE_EVENT, UPDATE_LOCALE_EVENT, DELETE_LOCALE_EVENT], () => {
      locales.exec();
    });

    return () => {
      return (
        <el-popover ref={popoverRef} width={250} trigger="click">
          {{
            reference: () => (
              <div class="flex items-center justify-center">
                <div
                  class="flex items-center justify-center px-2 border border-white rounded transition duration-300 ease-in-out text-sm text-white cursor-pointer py-1 text-center opacity-75 hover:opacity-100 focus:hover:opacity-100"
                  style={{
                    maxWidth: '150px',
                    width: '150px',
                  }}
                >
                  {state.locale && <LocaleIconComponent icon={state.locale.icon} />}

                  <span class="truncate px-2" title={state.locale?.title}>
                    {state.locale?.title}
                  </span>

                  <i class="el-icon-arrow-down el-icon--right" style={{ color: 'inherit' }} />
                </div>
              </div>
            ),

            default: () => {
              return (
                <div style={{ maxHeight: '400px' }} class="overflow-y-auto -mx-3">
                  <h5 class="px-3 font-bold pb-3">Available Locales</h5>

                  {(locales.result.value || []).map(locale => (
                    <div
                      class="flex items-center hover:bg-gray-100 cursor-pointer px-3 py-1"
                      role="button"
                      onClick={() => handleSetLocale(locale)}
                    >
                      <LocaleIconComponent icon={locale.icon} />

                      <span class="pl-3">{locale.title}</span>
                    </div>
                  ))}
                </div>
              );
            },
          }}
        </el-popover>
      );
    };
  },
});

export { LocaleIconComponent };

export default LocaleSelectorComponent;
