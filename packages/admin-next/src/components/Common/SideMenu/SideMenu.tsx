import { noop } from 'lodash';
import { computed, defineComponent, onUnmounted, withModifiers } from 'vue';
import { usePromise } from 'vue-composable';
import { useRoute } from 'vue-router';

import { Logo } from '../Logo';
import { RenderIfComponent } from '../RenderIf';

import { fetchAllSchemas, fetchAllSingletons } from '~/common/api';
import {
  CREATE_SCHEMA_EVENT,
  UPDATE_SCHEMA_EVENT,
  DELETE_SCHEMA_EVENT,
  CREATE_SINGLETON_EVENT,
  UPDATE_SINGLETON_EVENT,
  DELETE_SINGLETON_EVENT,
} from '~/common/events';
import { LocaleSelectorComponent } from '~/components/LocaleSelector';
import { useEvent } from '~/hooks';
import { useCan } from '~/hooks/useCan';
import { useConfig } from '~/hooks/useConfig';

export const SideMenu = defineComponent({
  name: 'SideMenuComponent',

  setup: () => {
    const config = useConfig();

    const { can, cant } = useCan();

    const { onAll, offAll } = useEvent();

    const route = useRoute();

    const schemas = usePromise(() => fetchAllSchemas());
    const singletons = usePromise(() => fetchAllSingletons());

    const activeItem = computed({
      get: () => route.path,
      set: noop,
    });

    const activeItems = computed({
      get: () =>
        route.path
          .split('/')
          .slice(1)
          .map((_, index, original) => original.slice(0, index).join('/')),
      set: noop,
    });

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

    return () => (
      <el-menu
        backgroundColor={config.ui.backgroundColor}
        textColor={config.ui.textColor}
        activeTextColor={config.ui.activeTextColour}
        // This is undocumented but it actually wants the raw ref
        defaultActive={activeItem}
        defaultOpened={activeItems}
        style="height: 100vh;"
      >
        <Logo class="my-3 mx-auto" style={{ maxWidth: '80%', maxHeight: '60px' }} />

        <div class="pb-3">
          <LocaleSelectorComponent />
        </div>

        <el-menu-item index="/">
          <i class="el-icon-s-home" />
          <router-link to="/">Home</router-link>
        </el-menu-item>

        {/* All Documents menu item */}
        <RenderIfComponent condition={can('internal:document:read')}>
          <el-menu-item index="/documents">
            <i class="el-icon-document" />
            <router-link to="/documents">Documents</router-link>
          </el-menu-item>
        </RenderIfComponent>

        {/* Documents with Schema dropdown */}
        <RenderIfComponent
          condition={cant('internal:document:read') && cant('internal:schema:read')}
        >
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
        </RenderIfComponent>

        {/* Schema dropdown with management */}
        <RenderIfComponent condition={can('internal:schema:read')}>
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
                        <i class="el-icon-invalid" />

                        <router-link to={`/schemas/${schema.id}`}>{schema.title}</router-link>
                      </el-menu-item>
                    ))}

                    <el-menu-item class="font-medium" index="/schemas">
                      <i class="el-icon-setting" />
                      <router-link to="/schemas">Management</router-link>
                    </el-menu-item>
                  </el-menu-item-group>
                );
              },
            }}
          </el-submenu>
        </RenderIfComponent>

        {/* Singleton dropdown with managedment */}
        <RenderIfComponent condition={can('internal:singleton:read')}>
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
                        <i class="el-icon-invalid" />

                        <router-link to={`/singletons/${singleton.id}`}>
                          {singleton.title}
                        </router-link>
                      </el-menu-item>
                    ))}

                    <el-menu-item class="font-medium" index="/singletons">
                      <i class="el-icon-setting" />
                      <router-link to="/singletons">Management</router-link>
                    </el-menu-item>
                  </el-menu-item-group>
                );
              },
            }}
          </el-submenu>
        </RenderIfComponent>

        {/* Settings SubMenu */}
        <el-submenu index="/settings">
          {{
            title: () => (
              <>
                <i class="el-icon-setting" />
                Settings
              </>
            ),
            default: () => {
              return (
                <el-menu-item-group>
                  <el-menu-item index="/settings/account">
                    <i class="el-icon-user" />

                    <router-link to="/settings/account">Account</router-link>
                  </el-menu-item>

                  <el-menu-item index="/settings/locales">
                    <i class="el-icon-map-location" />

                    <router-link to="/settings/locales">Locales</router-link>
                  </el-menu-item>
                </el-menu-item-group>
              );
            },
          }}
        </el-submenu>
      </el-menu>
    );
  },
});

export default SideMenu;
