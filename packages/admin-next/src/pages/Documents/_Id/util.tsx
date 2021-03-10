import { noop } from 'lodash';
import { withModifiers } from 'vue';
import { useRouter } from 'vue-router';

type Fn = () => any;

export const getHeaderActions = (saveHandler: Fn): JSX.Element => {
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

            <el-dropdown-item>
              <a class="block" onClick={withModifiers(noop, ['prevent'])}>
                <i class="el-icon-add-location" />
                Create Locale Override
              </a>
            </el-dropdown-item>
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
