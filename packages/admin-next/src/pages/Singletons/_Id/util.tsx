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
            {/* Create document for Singleton */}
            <el-dropdown-item>
              <router-link class="block" to={`/schemas/${schema.value?.id}/create`}>
                <i class="el-icon-folder-add" />
                Create Document
              </router-link>
            </el-dropdown-item>

            {/* Edit Singleton */}
            <el-dropdown-item>
              <router-link class="block" to={`/schemas/${schema.value?.id}/edit`}>
                <i class="el-icon-folder-add" />
                Edit Singleton
              </router-link>
            </el-dropdown-item>

            {/* Delete  */}
            <el-dropdown-item>
              <router-link class="block text-red-600" to={`/schemas/${schema.value?.id}/delete`}>
                <i class="el-icon-folder-delete" />
                Delete Singleton
              </router-link>
            </el-dropdown-item>

            {/* Import Singleton */}
            <el-dropdown-item divided>
              <router-link class="block" to={`/schemas/${schema.value?.id}/import`}>
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

export const getTableActions = (document: Document, _schema: Singleton): JSX.Element => {
  return (
    <div style="margin: 0 -10px">
      <div class="flex items-center -mx-2">
        <router-link title="Edit Document" class="px-2" to={`/documents/${document.id}`}>
          <i class="el-icon-edit-outline" />
        </router-link>

        <router-link title="View Revisions" class="px-2" to={`/documents/${document.id}/revisions`}>
          <i class="el-icon-folder-opened" />
        </router-link>
      </div>
    </div>
  );
};

export default getTableActions;
