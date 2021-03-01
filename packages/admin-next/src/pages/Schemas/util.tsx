import { Schema } from '@dockite/database';

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
            <router-link class="block" to="/schemas/create">
              <i class="el-icon-folder-add" />
              Create Schema
            </router-link>
          </el-dropdown-item>

          {/* Deleted Singletons */}
          <el-dropdown-item>
            <router-link class="block" to="/schemas/deleted">
              <i class="el-icon-folder-delete" />
              View Deleted Schemas
            </router-link>
          </el-dropdown-item>

          {/* Import Schema */}
          <el-dropdown-item divided>
            <router-link class="block" to="/schemas/import">
              <i class="el-icon-upload2" />
              Import Schema (JSON)
            </router-link>
          </el-dropdown-item>
        </el-dropdown-menu>
      ),
    }}
  </el-dropdown>
);

export const getTableActions = (schema: Schema): JSX.Element => {
  return (
    <div style="margin: 0 -10px">
      <div class="flex items-center -mx-2">
        <router-link title="Edit Schema" class="px-2" to={`/schemas/${schema.id}/edit`}>
          <i class="el-icon-edit-outline" />
        </router-link>

        <router-link title="View Revisions" class="px-2" to={`/schemas/${schema.id}/revisions`}>
          <i class="el-icon-folder-opened" />
        </router-link>

        <router-link title="Delete Schema" class="px-2" to={`/schemas/${schema.id}/delete`}>
          <i class="el-icon-folder-delete" />
        </router-link>
      </div>
    </div>
  );
};
