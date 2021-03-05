import { Singleton } from '@dockite/database';

export const getTableActions = (singleton: Singleton): JSX.Element => {
  return (
    <div style="margin: 0 -10px">
      <div class="flex items-center -mx-2">
        <router-link
          title="Restore Singleton"
          class="px-2"
          to={`/singletons/deleted/${singleton.id}/restore`}
        >
          <i class="el-icon-refresh-left" />
        </router-link>

        <router-link
          title="View Revisions"
          class="px-2"
          to={`/singletons/deleted/${singleton.id}/revisions`}
        >
          <i class="el-icon-folder-opened" />
        </router-link>

        <router-link
          title="Permanently Delete Singleton"
          class="px-2"
          to={`/singletons/deleted/${singleton.id}/permanent-delete`}
        >
          <i class="el-icon-folder-delete" />
        </router-link>
      </div>
    </div>
  );
};

export default getTableActions;
