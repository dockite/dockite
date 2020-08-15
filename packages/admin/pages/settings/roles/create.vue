<template>
  <fragment>
    <portal to="header">
      <h2>Create Role</h2>
    </portal>

    <div v-loading="loading > 0" class="dockite-create-role-page el-loading-parent__min-height">
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-position="top"
        @submit.native.prevent="submit"
      >
        <el-form-item label="Name" prop="name">
          <el-input v-model="form.name" type="name"></el-input>
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
              v-if="$can('internal:role:create')"
              type="primary"
              :disabled="loading > 0"
              native-type="submit"
              @click.prevent="submit"
            >
              Create Role
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
import { Component, Vue, Ref } from 'nuxt-property-decorator';
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
        {
          message: 'The given role name has already been used',
          trigger: 'blur',
          validator: (_rule: never, value: string, cb: Function) => {
            if (this.allRoles.results.filter(role => role.name === value).length > 0) {
              return cb(new Error());
            }

            return cb();
          },
        },
      ],
      scopes: [
        {
          type: 'array',
          min: 1,
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

      await this.$store.dispatch(`${role.namespace}/createRole`, {
        ...this.form,
      });

      this.$message({
        message: 'Role created successfully',
        type: 'success',
      });

      this.$router.push('/settings/roles');
    } catch (err) {
      console.log(err);
      this.$message({
        message: 'Unable to create role, please ensure that the details are correct and try again.',
        type: 'warning',
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

  mounted(): void {
    this.form = this.initialFormState;
    this.fetchAllRoles();
    this.fetchAllScopes();
  }
}
</script>

<style lang="scss">
.dockite-create-role-page {
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
