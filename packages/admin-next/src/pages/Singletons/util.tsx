import { Singleton } from '@dockite/database';

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
          {/* Create Singleton */}
          <el-dropdown-item>
            <router-link class="block" to="/singletons/create">
              <i class="el-icon-folder-add" />
              Create Singleton
            </router-link>
          </el-dropdown-item>

          {/* Deleted Singletons */}
          <el-dropdown-item>
            <router-link class="block" to="/singletons/deleted">
              <i class="el-icon-folder-delete" />
              View Deleted Singletons
            </router-link>
          </el-dropdown-item>

          {/* Import Singleton */}
          <el-dropdown-item divided>
            <router-link class="block" to="/singletons/import">
              <i class="el-icon-upload2" />
              Import Singleton (JSON)
            </router-link>
          </el-dropdown-item>
        </el-dropdown-menu>
      ),
    }}
  </el-dropdown>
);

export const getTableActions = (schema: Singleton): JSX.Element => {
  return (
    <div style="margin: 0 -10px">
      <div class="flex items-center -mx-2">
        <router-link title="Edit Singleton" class="px-2" to={`/singletons/${schema.id}/edit`}>
          <i class="el-icon-edit-outline" />
        </router-link>

        <router-link title="View Revisions" class="px-2" to={`/singletons/${schema.id}/revisions`}>
          <i class="el-icon-folder-opened" />
        </router-link>
      </div>
    </div>
  );
};
