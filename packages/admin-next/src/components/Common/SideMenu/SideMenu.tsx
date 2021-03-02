import { noop } from 'lodash';
import { computed, defineComponent, onUnmounted, withModifiers } from 'vue';
import { usePromise } from 'vue-composable';
import { useRoute } from 'vue-router';

import { Logo } from '../Logo';

import { fetchAllSchemas, fetchAllSingletons } from '~/common/api';
import {
  CREATE_SCHEMA_EVENT,
  UPDATE_SCHEMA_EVENT,
  DELETE_SCHEMA_EVENT,
  CREATE_SINGLETON_EVENT,
  UPDATE_SINGLETON_EVENT,
  DELETE_SINGLETON_EVENT,
} from '~/common/events';
import { useEvent } from '~/hooks';
import { useCan } from '~/hooks/useCan';
import { useConfig } from '~/hooks/useConfig';

export const SideMenu = defineComponent({
  name: 'SideMenuComponent',

  setup: () => {
    const config = useConfig();
    const can = useCan();
    const { onAll, offAll } = useEvent();
    const route = useRoute();

    const schemas = usePromise(() => fetchAllSchemas());
    const singletons = usePromise(() => fetchAllSingletons());

    console.log({ schemas, singletons });

    const handleSchemasChanged = (): void => {
      schemas.exec();
    };

    const handleSingletonsChanged = (): void => {
      singletons.exec();
    };

    // Register Schema change listeners
    onAll([CREATE_SCHEMA_EVENT, UPDATE_SCHEMA_EVENT, DELETE_SCHEMA_EVENT], handleSchemasChanged);

    // Register Singleton change listeners
    onAll(
      [CREATE_SINGLETON_EVENT, UPDATE_SINGLETON_EVENT, DELETE_SINGLETON_EVENT],
      handleSingletonsChanged,
    );

    onUnmounted(() => {
      offAll([CREATE_SCHEMA_EVENT, UPDATE_SCHEMA_EVENT, DELETE_SCHEMA_EVENT], handleSchemasChanged);

      offAll(
        [CREATE_SINGLETON_EVENT, UPDATE_SINGLETON_EVENT, DELETE_SINGLETON_EVENT],
        handleSingletonsChanged,
      );
    });

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
                if (singletons.loading.value) {
                  return (
                    <el-menu-item-group>
                      <el-menu-item>
                        Fetching Singletons <i class="el-icon-loading" />
                      </el-menu-item>
                    </el-menu-item-group>
                  );
                }

                if (singletons.result.value === null || singletons.error.value) {
                  return (
                    <div>
                      <el-menu-item index="/singletons/error">
                        Error occurred while fetching Singletons
                        <a
                          class="block underline font-bold"
                          onClick={withModifiers(singletons.exec, ['prevent'])}
                        >
                          Retry?
                        </a>
                      </el-menu-item>
                    </div>
                  );
                }

                return (
                  <el-menu-item-group>
                    {singletons.result.value.map(singleton => (
                      <el-menu-item index={`/singletons/${singleton.id}`}>
                        <i class="el-icon-invalid"></i>
                        <router-link to={`/singletons/${singleton.id}`}>
                          {singleton.title}
                        </router-link>
                      </el-menu-item>
                    ))}

                    <el-menu-item class="font-semibold" index="/singletons">
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
                if (schemas.loading.value) {
                  return (
                    <el-menu-item-group>
                      <el-menu-item>
                        Fetching Schemas <i class="el-icon-loading" />
                      </el-menu-item>
                    </el-menu-item-group>
                  );
                }

                if (schemas.result.value === null || schemas.error.value) {
                  return (
                    <el-menu-item index="/schemas/error">
                      Error occurred while fetching Schemas
                      <a
                        class="block font-bold underline"
                        onClick={withModifiers(schemas.exec, ['prevent'])}
                      >
                        Retry?
                      </a>
                    </el-menu-item>
                  );
                }

                return (
                  <el-menu-item-group>
                    {schemas.result.value.map(schema => (
                      <el-menu-item index={`/schemas/${schema.id}`}>
                        <i class="el-icon-invalid"></i>
                        <router-link to={`/schemas/${schema.id}`}>{schema.title}</router-link>
                      </el-menu-item>
                    ))}

                    <el-menu-item class="font-semibold" index="/schemas">
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
              if (schemas.loading.value) {
                return (
                  <el-menu-item-group>
                    <el-menu-item>
                      Fetching Schemas <i class="el-icon-loading" />
                    </el-menu-item>
                  </el-menu-item-group>
                );
              }

              if (schemas.result.value === null || schemas.error.value) {
                return (
                  <el-menu-item index="/schemas/error">
                    Error occurred while fetching Schemas
                    <a
                      class="block font-bold underline"
                      onClick={withModifiers(schemas.exec, ['prevent'])}
                    >
                      Retry?
                    </a>
                  </el-menu-item>
                );
              }

              return (
                <el-menu-item-group>
                  {schemas.result.value.map(schema => (
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

    const activeItem = computed({
      get: () => route.path,
      set: noop,
    });

    return () => (
      <el-menu
        backgroundColor={config.ui.backgroundColor}
        textColor={config.ui.textColor}
        activeTextColor={config.ui.activeTextColour}
        defaultActive={activeItem}
        style="height: 100vh;"
      >
        <Logo class="mt-3 mx-auto" style={{ maxWidth: '80%', maxHeight: '60px' }} />

        <el-menu-item index="/">
          <i class="el-icon-s-home" />
          <router-link to="/">Home</router-link>
        </el-menu-item>

        {getDocumentMenuItem()}

        {getSchemaMenuItem()}

        {getSingletonMenuItem()}
      </el-menu>
    );
  },
});

export default SideMenu;
