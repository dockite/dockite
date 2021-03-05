import { Ref } from 'vue';

import { Document, Singleton } from '@dockite/database';

export const getHeaderActions = (schema: Ref<Singleton | null>): JSX.Element => {
  return (
    <el-dropdown>
      {{
        default: () => (
          <el-button size="medium">
            Actions <i class="el-icon-arrow-down el-icon--right" />
          </el-button>
        ),
        dropdown: () => (
          <el-dropdown-menu>
            {/* Edit Singleton */}
            <el-dropdown-item>
              <router-link class="block" to={`/singletons/${schema.value?.id}/edit`}>
                <i class="el-icon-folder-add" />
                Edit Singleton
              </router-link>
            </el-dropdown-item>

            {/* Delete  */}
            <el-dropdown-item>
              <router-link class="block text-red-600" to={`/singletons/${schema.value?.id}/delete`}>
                <i class="el-icon-folder-delete" />
                Delete Singleton
              </router-link>
            </el-dropdown-item>

            {/* Import Singleton */}
            <el-dropdown-item divided>
              <router-link class="block" to={`/singletons/${schema.value?.id}/import`}>
                <i class="el-icon-upload2" />
                Advanced Singleton Editor (JSON)
              </router-link>
            </el-dropdown-item>
          </el-dropdown-menu>
        ),
      }}
    </el-dropdown>
  );
};

export default getHeaderActions;
