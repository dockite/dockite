import { defineComponent } from 'vue';
import { usePromise } from 'vue-composable';
import { useRoute } from 'vue-router';

import { fetchAllSchemas, fetchAllSingletons } from '~/common/api';
import { useCan } from '~/hooks/useCan';
import { useConfig } from '~/hooks/useConfig';

export const SideMenu = defineComponent(() => {
  const config = useConfig();
  const can = useCan();

  const schemaPromise = usePromise(() => fetchAllSchemas());
  const singletonPromise = usePromise(() => fetchAllSingletons());

  const getSingletonMenuItem = (): JSX.Element | null => {
    if (can('internal:singleton:read')) {
      return (
        <el-submenu index="/singletons">
          {{
            title: () => (
              <>
                <i class="el-icon-notebook-2" />
                Singletons
              </>
            ),
            default: () => {
              if (singletonPromise.loading.value) {
                return (
                  <el-menu-item-group>
                    <el-menu-item>
                      Fetching Singletons <i class="el-icon-loading" />
                    </el-menu-item>
                  </el-menu-item-group>
                );
              }

              if (singletonPromise.result.value === null || singletonPromise.error.value) {
                return (
                  <div>
                    Error occurred whilst fetching Singletons{' '}
                    <a class="font-bold" onClick={singletonPromise.exec}>
                      Retry?
                    </a>
                    ...
                  </div>
                );
              }

              return (
                <el-menu-item-group>
                  {singletonPromise.result.value.map(singleton => (
                    <el-menu-item index={`/singletons/${singleton.id}`}>
                      <i class="el-icon-invalid"></i>
                      <router-link to={`/singletons/${singleton.id}`}>
                        {singleton.title}
                      </router-link>
                    </el-menu-item>
                  ))}

                  <el-menu-item class="font-semibold">
                    <i class="el-icon-setting" />
                    <router-link to="/singletons">Management</router-link>
                  </el-menu-item>
                </el-menu-item-group>
              );
            },
          }}
        </el-submenu>
      );
    }

    return null;
  };

  const getSchemaMenuItem = (): JSX.Element | null => {
    if (can('internal:schema:read')) {
      return (
        <el-submenu index="/schemas">
          {{
            title: () => (
              <>
                <i class="el-icon-s-grid" />
                Schemas
              </>
            ),
            default: () => {
              if (schemaPromise.loading.value) {
                return (
                  <el-menu-item-group>
                    <el-menu-item>
                      Fetching Schemas <i class="el-icon-loading" />
                    </el-menu-item>
                  </el-menu-item-group>
                );
              }

              if (schemaPromise.result.value === null || schemaPromise.error.value) {
                return (
                  <div>
                    Error occurred whilst fetching Schemas{' '}
                    <a class="font-bold" onClick={schemaPromise.exec}>
                      Retry?
                    </a>
                    ...
                  </div>
                );
              }

              return (
                <el-menu-item-group>
                  {schemaPromise.result.value.map(schema => (
                    <el-menu-item index={`/schemas/${schema.id}`}>
                      <i class="el-icon-invalid"></i>
                      <router-link to={`/schemas/${schema.id}`}>{schema.title}</router-link>
                    </el-menu-item>
                  ))}

                  <el-menu-item class="font-semibold" index="/schemas/management">
                    <i class="el-icon-setting" />
                    <router-link to="/schemas">Management</router-link>
                  </el-menu-item>
                </el-menu-item-group>
              );
            },
          }}
        </el-submenu>
      );
    }

    return null;
  };

  const getDocumentMenuItem = (): JSX.Element | null => {
    if (can('internal:document:read')) {
      return (
        <el-menu-item index="/documents">
          <i class="el-icon-document" />
          <router-link to="/documents">Documents</router-link>
        </el-menu-item>
      );
    }

    return (
      <el-submenu index="/documents">
        {{
          title: () => (
            <>
              <i class="el-icon-document" />
              Documents
            </>
          ),
          default: () => {
            if (schemaPromise.loading.value) {
              return (
                <el-menu-item-group>
                  <el-menu-item>
                    Fetching Schemas <i class="el-icon-loading" />
                  </el-menu-item>
                </el-menu-item-group>
              );
            }

            if (schemaPromise.result.value === null || schemaPromise.error.value) {
              return (
                <div>
                  Error occurred whilst fetching Schemas{' '}
                  <a class="font-bold" onClick={schemaPromise.exec}>
                    Retry?
                  </a>
                  ...
                </div>
              );
            }

            return (
              <el-menu-item-group>
                {schemaPromise.result.value.map(schema => (
                  <el-menu-item index={`/schemas/${schema.id}`}>
                    <router-link to={`/schemas/${schema.id}`}>{schema.title}</router-link>
                  </el-menu-item>
                ))}
              </el-menu-item-group>
            );
          },
        }}
      </el-submenu>
    );
  };

  const getDefaultActive = (): string => {
    const route = useRoute();

    const active = route.path;

    return active;
  };

  return () => (
    <el-menu
      backgroundColor={config.ui.backgroundColor}
      textColor={config.ui.textColor}
      activeTextColor={config.ui.activeTextColour}
      defaultActive={getDefaultActive()}
      defaultOpeneds={[getDefaultActive()]}
      uniqueOpened
      style="height: 100vh;"
    >
      <el-menu-item index="/">
        <i class="el-icon-s-home" />
        <router-link to="/">Home</router-link>
      </el-menu-item>

      {getDocumentMenuItem()}

      {getSchemaMenuItem()}

      {getSingletonMenuItem()}
    </el-menu>
  );
});

export default SideMenu;
