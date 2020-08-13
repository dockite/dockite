<template>
  <fragment>
    <portal to="header">
      <h2>Update {{ form.name }}</h2>
    </portal>

    <div v-loading="loading > 0" class="dockite-update-role-page">
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-position="top"
        @submit.native.prevent="submit"
      >
        <el-form-item label="Name" prop="name">
          <el-input v-model="form.name" :disabled="true"></el-input>
        </el-form-item>

        <el-form-item label="Scopes" prop="scopes">
          <el-select
            v-model="form.scopes"
            multiple
            filterable
            placeholder="Select Scopes"
            style="width: 100%"
          >
            <el-option v-for="scope in allScopes" :key="scope" :value="scope">
              {{ scope }}
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-row type="flex" justify="space-between" align="middle">
            <span />
            <el-button
              v-if="$can('internal:role:update')"
              type="primary"
              :disabled="loading > 0"
              native-type="submit"
              @click.prevent="submit"
            >
              Update Role
            </el-button>
          </el-row>
        </el-form-item>
      </el-form>
    </div>
  </fragment>
</template>

<script lang="ts">
import { Role } from '@dockite/database';
import { Form } from 'element-ui';
import { Component, Vue, Ref, Watch } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import { ManyResultSet, AllRolesResultItem } from '~/common/types';
import * as data from '~/store/data';
import * as role from '~/store/role';

type RoleForm = Omit<Role, 'createdAt' | 'updatedAt'>;

@Component({
  components: {
    Fragment,
  },
})
export default class CreateRolePage extends Vue {
  public loading = 0;

  public form: RoleForm = {
    name: '',
    scopes: [],
  };

  @Ref()
  readonly formRef!: Form;

  get roleName(): string {
    return this.$route.params.id;
  }

  get role(): Role | null {
    return this.$store.getters[`${data.namespace}/getRoleByName`](this.roleName);
  }

  get allScopes(): string[] {
    const state: data.DataState = this.$store.state[data.namespace];

    return state.allScopes;
  }

  get allRoles(): ManyResultSet<AllRolesResultItem> {
    const state: data.DataState = this.$store.state[data.namespace];

    return state.allRoles;
  }

  get initialFormState(): RoleForm {
    return {
      name: '',
      scopes: [],
    };
  }

  get formRules(): object {
    const $t = this.$t.bind(this);

    return {
      name: [
        {
          required: true,
          message: $t('validationMessages.required', ['Name']),
          trigger: 'blur',
        },
      ],
      scopes: [
        {
          type: 'array',
          min: 0,
          message: $t('validationMessages.required', ['Role Scopes']),
          trigger: 'blur',
        },
      ],
    };
  }

  public async submit(): Promise<void> {
    try {
      this.loading += 1;

      await this.formRef.validate();

      await this.$store.dispatch(`${role.namespace}/updateRole`, {
        ...this.form,
        name: this.roleName,
      });

      this.$message({
        message: 'Role updated successfully',
        type: 'success',
      });

      this.$router.push('/settings/roles');
    } catch (err) {
      console.log(err);
      this.$message({
        message: 'Unable to update role, please ensure that the details are correct and try again.',
        type: 'warning',
      });
    } finally {
      this.loading -= 1;
    }
  }

  public async fetchRoleByName(name: string): Promise<void> {
    try {
      this.loading += 1;

      await this.$store.dispatch(`${data.namespace}/fetchRoleByName`, { name });
    } catch (_) {
      this.$message({
        message: 'An error occurred whilst fetching the role, please try again later.',
        type: 'error',
      });
    } finally {
      this.loading -= 1;
    }
  }

  public async fetchAllRoles(): Promise<void> {
    try {
      this.loading += 1;

      await this.$store.dispatch(`${data.namespace}/fetchAllRoles`, { perPage: 10000 });
    } catch (_) {
      this.$message({
        message: 'An error occurred whilst fetching roles, please try again later.',
        type: 'error',
      });
    } finally {
      this.loading -= 1;
    }
  }

  public async fetchAllScopes(): Promise<void> {
    try {
      this.loading += 1;

      await this.$store.dispatch(`${data.namespace}/fetchAllScopes`);
    } catch (_) {
      this.$message({
        message: 'An error occurred whilst fetching scopes, please try again later.',
        type: 'error',
      });
    } finally {
      this.loading -= 1;
    }
  }

  @Watch('roleName', { immediate: true })
  handleRoleIdChange(name: string): void {
    this.fetchRoleByName(name);
  }

  @Watch('role', { immediate: true })
  handleRoleChange(role: Omit<Role, 'handleNormalizeScopes'>): void {
    if (role) {
      this.form = {
        name: role.name,
        scopes: role.scopes,
      };
    }
  }

  mounted(): void {
    this.form = this.initialFormState;

    if (this.role) {
      this.handleRoleChange(this.role);
    }

    this.fetchAllRoles();
    this.fetchAllScopes();
  }
}
</script>

<style lang="scss">
.dockite-update-role-page {
  padding: 1rem;
  background: #ffffff;
}

.el-form-item.is-error {
  .CodeMirror {
    border: 1px solid #f56c6c;
  }
}

.CodeMirror {
  line-height: normal;
  padding: 0.5rem 0;
  margin-bottom: 0.25rem;
}
</style>
