import { computed, defineComponent } from 'vue';
import { usePromise } from 'vue-composable';

import { LocaleIconComponent } from './LocaleIcon';

import { fetchAllLocales } from '~/common/api/locales';
import { useState } from '~/hooks/useState';

export const LocaleSelectorComponent = defineComponent({
  name: 'LocaleSelectorComponent',

  setup: () => {
    const state = useState();

    const locales = usePromise(() => fetchAllLocales());

    const currentLocale = computed(() => {
      if (locales.result.value) {
        const locale = locales.result.value.find(l => l.id === state.locale);

        if (locale) {
          return locale;
        }
      }

      return null;
    });

    return () => {
      return (
        <el-popover width={400} trigger="click">
          {{
            reference: () => (
              <div class="flex items-center justify-center">
                <div
                  class="border rounded cursor-pointer py-1"
                  style={{ maxWidth: '150px', width: '150px' }}
                >
                  {currentLocale.value && <LocaleIconComponent icon={currentLocale.value.icon} />}

                  <span class="truncate" title={currentLocale.value?.title}>
                    {currentLocale.value?.title}
                  </span>

                  <i class="el-icon-down el-icon--right" />
                </div>
              </div>
            ),

            default: () => {
              return (
                <div style={{ maxHeight: '400px' }} class="overflow-y-auto -mx-3">
                  {(locales.result.value || []).map(locale => (
                    <div class="flex items-center hover:bg-gray-100 cursor-pointer px-3 py-1">
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

export default LocaleSelectorComponent;
