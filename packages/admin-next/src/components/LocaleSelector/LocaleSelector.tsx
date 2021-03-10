import { computed, defineComponent } from 'vue';
import { usePromise } from 'vue-composable';

import { fetchAllLocales } from '~/common/api/locales';
import useState from '~/hooks/useState';

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
              <div class="border rounded py-1">
                {currentLocale.value && (
                  <img
                    src={currentLocale.value.icon}
                    alt="Current Locale"
                    style={{ maxWidth: '25px', maxHeight: '25px' }}
                  />
                )}
                <i class="el-icon-down el-icon-right" />
              </div>
            ),
          }}
        </el-popover>
      );
    };
  },
});

export default LocaleSelectorComponent;
