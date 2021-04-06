import { Ref } from 'vue';

import { Document, Schema } from '@dockite/database';

export const getHeaderActions = (schema: Ref<Schema | null>): JSX.Element => {
  return (
    <router-link to={`/schemas/${schema.value?.id}`}>
      <el-button>
        <i class="el-icon-back el-icon--left" />
        Back
      </el-button>
    </router-link>
  );
};

export const getTableActions = (document: Document, _schema: Schema): JSX.Element => {
  return (
    <div style="margin: 0 -10px">
      <div class="flex items-center -mx-2">
        <router-link
          title="Restore Document"
          class="px-2"
          to={`/documents/deleted/${document.id}/restore`}
        >
          <i class="el-icon-refresh-left" />
        </router-link>

        <router-link
          title="View Revisions"
          class="px-2"
          to={`/documents/deleted/${document.id}/revisions`}
        >
          <i class="el-icon-folder-opened" />
        </router-link>

        <router-link
          title="Permanently Delete Document"
          class="px-2 text-red-600 hover:text-red-600 hover:opacity-50"
          to={`/documents/deleted/${document.id}/permanent-delete`}
        >
          <i class="el-icon-delete" />
        </router-link>
      </div>
    </div>
  );
};

export default getTableActions;
