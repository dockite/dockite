import { noop } from 'lodash';
import { defineComponent, PropType, ref, withModifiers } from 'vue';
import { usePromise } from 'vue-composable';
import { useRouter } from 'vue-router';

import { Document } from '@dockite/database';

import { fetchAllLocales } from '~/common/api/locales';
import { RenderIfComponent } from '~/components/Common/RenderIf';
import { LocaleIconComponent } from '~/components/LocaleSelector';
import { useState } from '~/hooks';
import { isRootLocale } from '~/utils';

export interface DocumentHeaderActionsDropdownComponentProps {
  document: Document;
}

export const DocumentHeaderActionsDropdownComponent = defineComponent({
  name: 'DocumentHeaderActionsDropdownComponent',

  props: {
    document: {
      type: Object as PropType<DocumentHeaderActionsDropdownComponentProps['document']>,
    },
  },

  setup: (props, ctx) => {
    const router = useRouter();

    const state = useState();

    const showCreateLocaleOverrideDialog = ref(false);

    const locales = usePromise(() => fetchAllLocales());

    const localeToCreateOverrideFor = ref('');

    const handleShowCreateLocaleOverrideDialog = (): void => {
      showCreateLocaleOverrideDialog.value = true;
    };

    const handleCreateLocaleOverride = async (): Promise<void> => {
      if (props.document && localeToCreateOverrideFor.value) {
        router.push({
          path: `/schemas/${props.document.schemaId}/create`,
          query: { parent: props.document.id, locale: localeToCreateOverrideFor.value },
        });
      }
    };

    return () => {
      return (
        <div>
          <el-dropdown splitButton onClick={() => ctx.emit('action:saveDocument')}>
            {{
              default: () => <span>Save</span>,

              dropdown: () => (
                <el-dropdown-menu>
                  <el-dropdown-item>
                    <a class="block" onClick={withModifiers(noop, ['prevent'])}>
                      <i class="el-icon-takeaway-box" />
                      Save as Draft
                    </a>
                  </el-dropdown-item>

                  <el-dropdown-item>
                    <a class="block" onClick={withModifiers(noop, ['prevent'])}>
                      <i class="el-icon-date" />
                      Add to Release
                    </a>
                  </el-dropdown-item>

                  <RenderIfComponent condition={isRootLocale(state.locale)}>
                    <el-dropdown-item>
                      <a
                        class="block"
                        onClick={withModifiers(handleShowCreateLocaleOverrideDialog, ['prevent'])}
                      >
                        <i class="el-icon-add-location" />
                        Create Locale Override
                      </a>
                    </el-dropdown-item>
                  </RenderIfComponent>
                </el-dropdown-menu>
              ),
            }}
          </el-dropdown>

          <el-dialog
            v-model={showCreateLocaleOverrideDialog.value}
            title="Select a Locale"
            customClass="w-full max-w-screen-xl"
          >
            {{
              default: () => (
                <el-form class="-my-8">
                  <el-form-item label="Locale to create an override for">
                    <el-select v-model={localeToCreateOverrideFor.value} class="w-full">
                      {(locales.result.value ?? []).map(locale => (
                        <el-option label={locale.title} value={locale.id}>
                          <LocaleIconComponent icon={locale.icon} />

                          <span class="px-2">{locale.title}</span>
                        </el-option>
                      ))}
                    </el-select>

                    <div class="el-form-item__description break-normal">
                      The locale to create an override for, if there is already an override for the
                      provided locale you will be redirected to the document instead.
                    </div>
                  </el-form-item>
                </el-form>
              ),

              footer: () => (
                <div class="flex justify-between items-center">
                  <el-button
                    onClick={() => {
                      showCreateLocaleOverrideDialog.value = false;
                    }}
                  >
                    Cancel
                  </el-button>

                  <el-button type="primary" onClick={() => handleCreateLocaleOverride()}>
                    Create Locale Override
                  </el-button>
                </div>
              ),
            }}
          </el-dialog>
        </div>
      );
    };
  },
});

export default DocumentHeaderActionsDropdownComponent;
