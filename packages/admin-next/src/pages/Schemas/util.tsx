import { Schema } from '@dockite/database';

export const getActions = (schema: Schema): JSX.Element => {
  return (
    <div style="margin: 0 -10px">
      <div class="flex items-center -mx-2">
        <router-link title="Edit Schema" class="px-2" to={`/schemas/${schema.id}`}>
          <i class="el-icon-edit-outline" />
        </router-link>

        <router-link title="View Revisions" class="px-2" to={`/schemas/${schema.id}/revisions`}>
          <i class="el-icon-folder-opened" />
        </router-link>
      </div>
    </div>
  );
};

export default getActions;
