import { noop } from 'lodash';
import { withModifiers } from 'vue';
import { useRouter } from 'vue-router';

import { RenderIfComponent } from '~/components/Common/RenderIf';
import { useState } from '~/hooks';
import { isRootLocale } from '~/utils';

type Fn = () => any;

export const getHeaderActions = (saveHandler: Fn, createLocaleOverrideHandler: Fn): JSX.Element => {
  const state = useState();

  return (
    <el-dropdown splitButton onClick={() => saveHandler()}>
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
                <a class="block" onClick={withModifiers(createLocaleOverrideHandler, ['prevent'])}>
                  <i class="el-icon-add-location" />
                  Create Locale Override
                </a>
              </el-dropdown-item>
            </RenderIfComponent>
          </el-dropdown-menu>
        ),
      }}
    </el-dropdown>
  );
};

export const getFooter = (): JSX.Element => {
  const router = useRouter();

  return (
    <div class="flex pt-3 justify-between">
      <el-button type="text" onClick={() => router.back()}>
        Go Back
      </el-button>
    </div>
  );
};
