import { ElMessage } from 'element-plus';
import { defineComponent, ref } from 'vue';
import { usePromiseLazy } from 'vue-composable';

import { createApiKey, deleteApiKey } from '~/common/api';
import { ApiKeyComponent } from '~/components/Account/Settings/ApiKey/ApiKey';
import { RenderIfComponent } from '~/components/Common/RenderIf';
import { useAuth, useCan } from '~/hooks';

export const AccountPage = defineComponent({
  name: 'AccountPage',

  setup: () => {
    const { state } = useAuth();
    const { can } = useCan();

    const newPassword = ref('');

    const handleCreateApiKey = usePromiseLazy(async () => {
      try {
        await createApiKey();
        ElMessage.success('API key successfully created!');
      } catch {
        ElMessage.error('An error occurred while creating the API key');
      }
    });

    const handleDeleteApiKey = usePromiseLazy(async (key: string) => {
      try {
        await deleteApiKey(key);
        ElMessage.success('API key successfully deleted!');
      } catch {
        ElMessage.error('An error occurred while deleting the API key');
      }
    });

    return () => {
      if (!state.user && !handleCreateApiKey.loading.value && !handleDeleteApiKey.loading.value) {
        return <div>An error occurred when retrieving your user account.</div>;
      }

      return (
        <el-form
          labelPosition="top"
          v-loading={handleCreateApiKey.loading.value || handleDeleteApiKey.loading.value}
        >
          <el-form-item label="Email">
            <el-input modelValue={state.user!.email} disabled />
          </el-form-item>

          <el-form-item label="First Name">
            <el-input modelValue={state.user!.firstName} disabled />
          </el-form-item>

          <el-form-item label="Last Name">
            <el-input modelValue={state.user!.lastName} disabled />
          </el-form-item>

          <RenderIfComponent condition={state.type === 'internal'}>
            <el-form-item label="Password">
              <div class="flex -mx-3">
                <div class="flex-1 px-3">
                  <el-input modelValue={newPassword.value} placeholder="Update Password" />
                </div>

                <div class="px-3">
                  <el-button>Update Password</el-button>
                </div>
              </div>
            </el-form-item>
          </RenderIfComponent>

          <el-form-item label="Scopes">
            <RenderIfComponent condition={state.user!.scopes.length === 0}>
              <i>No scopes have been assigned to your account.</i>
            </RenderIfComponent>

            <div class="flex items-center flex-wrap">
              {state.user!.scopes.map(scope => (
                <el-tag size="small" class="mr-3 mb-3">
                  {scope}
                </el-tag>
              ))}
            </div>
          </el-form-item>

          <el-form-item label="Roles">
            <RenderIfComponent condition={state.user!.roles.length === 0}>
              <i>No roles have been assigned to your account.</i>
            </RenderIfComponent>

            <div class="flex items-center flex-wrap">
              {state.user!.roles.map(role => (
                <el-tag size="small" class="mr-3 mb-3">
                  {role.name}
                </el-tag>
              ))}
            </div>
          </el-form-item>

          <RenderIfComponent condition={can('internal:apikey:create')}>
            <el-form-item label="API Keys">
              <RenderIfComponent condition={state.user!.apiKeys.length === 0}>
                <i>You currently don't have any API Keys.</i>
              </RenderIfComponent>

              <div>
                {state.user!.apiKeys.map(key => (
                  <div class="flex items-center border-b last:border-b-0 last:mb-0 py-3">
                    <ApiKeyComponent apiKey={key} />

                    <el-button
                      size="small"
                      type="danger"
                      onClick={() => handleDeleteApiKey.exec(key)}
                    >
                      Revoke Key
                    </el-button>
                  </div>
                ))}
              </div>

              <div class="pt-3 flex items-center justify-center">
                <el-button onClick={() => handleCreateApiKey.exec()}>Create API Key</el-button>
              </div>
            </el-form-item>
          </RenderIfComponent>
        </el-form>
      );
    };
  },
});

export default AccountPage;
