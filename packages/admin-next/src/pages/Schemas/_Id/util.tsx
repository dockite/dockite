import { Ref } from 'vue';

import { Document, Schema } from '@dockite/database';

export const getHeaderActions = (schema: Ref<Schema | null>): JSX.Element => {
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
            {/* Create Schema */}
            <el-dropdown-item>
              <router-link class="block" to={`/schemas/${schema.value?.id}/create`}>
                <i class="el-icon-folder-add" />
                Create Document
              </router-link>
            </el-dropdown-item>

            <el-dropdown-item>
              <router-link class="block" to={`/schemas/${schema.value?.id}/edit`}>
                <i class="el-icon-folder-add" />
                Edit Schema
              </router-link>
            </el-dropdown-item>

            {/* Deleted Schemas */}
            <el-dropdown-item>
              <router-link
                class="block text-red-600 hover:text-red-600 hover:opacity-50"
                to={`/schemas/${schema.value?.id}/delete`}
              >
                <i class="el-icon-folder-delete" />
                Delete Schema
              </router-link>
            </el-dropdown-item>

            {/* Import Schema */}
            <el-dropdown-item divided>
              <router-link class="block" to={`/schemas/${schema.value?.id}/import`}>
                <i class="el-icon-upload2" />
                Advanced Schema Editor (JSON)
              </router-link>
            </el-dropdown-item>
          </el-dropdown-menu>
        ),
      }}
    </el-dropdown>
  );
};

export const getTableActions = (document: Document, _schema: Schema): JSX.Element => {
  return (
    <div style="margin: 0 -10px">
      <div class="flex items-center -mx-2">
        <router-link title="Edit Document" class="px-2" to={`/documents/${document.id}`}>
          <i class="el-icon-edit-outline" />
        </router-link>

        <router-link title="View Revisions" class="px-2" to={`/documents/${document.id}/revisions`}>
          <i class="el-icon-folder-opened" />
        </router-link>

        <router-link
          title="Edit Document"
          class="px-2 text-red-600 hover:text-red-600 hover:opacity-50"
          to={`/documents/${document.id}/delete`}
        >
          <i class="el-icon-delete" />
        </router-link>
      </div>
    </div>
  );
};

export default getTableActions;
