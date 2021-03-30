import { Locale } from '@dockite/database';

export const getHeaderActions = (): JSX.Element => (
  <el-dropdown>
    {{
      default: () => (
        <el-button size="medium">
          Actions <i class="el-icon-arrow-down el-icon--right" />
        </el-button>
      ),
      dropdown: () => (
        <el-dropdown-menu>
          {/* Create Schema */}
          <el-dropdown-item>
            <router-link class="block" to="/settings/locales/create">
              <i class="el-icon-add-location" />
              Create Locale
            </router-link>
          </el-dropdown-item>
        </el-dropdown-menu>
      ),
    }}
  </el-dropdown>
);

export const getTableActions = (locale: Locale): JSX.Element => {
  return (
    <div style="margin: 0 -10px">
      <div class="flex items-center -mx-2">
        <router-link title="Edit Locale" class="px-2" to={`/settings/locales/${locale.id}`}>
          <i class="el-icon-edit-outline" />
        </router-link>

        <router-link
          title="Delete Locale"
          class="px-2"
          to={`/settings/locales/${locale.id}/delete`}
        >
          <i class="el-icon-delete" />
        </router-link>
      </div>
    </div>
  );
};
