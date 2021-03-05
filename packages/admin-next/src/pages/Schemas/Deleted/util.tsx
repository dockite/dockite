import { Schema } from '@dockite/database';

export const getTableActions = (schema: Schema): JSX.Element => {
  return (
    <div style="margin: 0 -10px">
      <div class="flex items-center -mx-2">
        <router-link
          title="Restore Schema"
          class="px-2"
          to={`/schemas/deleted/${schema.id}/restore`}
        >
          <i class="el-icon-refresh-left" />
        </router-link>

        <router-link
          title="View Revisions"
          class="px-2"
          to={`/schemas/deleted/${schema.id}/revisions`}
        >
          <i class="el-icon-folder-opened" />
        </router-link>

        <router-link
          title="Permanently Delete Schema"
          class="px-2"
          to={`/schemas/deleted/${schema.id}/permanent-delete`}
        >
          <i class="el-icon-folder-delete" />
        </router-link>
      </div>
    </div>
  );
};

export default getTableActions;
