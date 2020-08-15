<template>
  <fragment>
    <portal to="header">
      <h2>Create User</h2>
    </portal>

    <div v-loading="loading > 0" class="dockite-create-user-page el-loading-parent__min-height">
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-position="top"
        @submit.native.prevent="submit"
      >
        <el-form-item label="Email" prop="email">
          <el-input v-model="form.email" type="email"></el-input>
        </el-form-item>

        <el-form-item label="Password" prop="password">
          <el-input v-model="form.password" type="password"></el-input>
        </el-form-item>

        <el-form-item label="First Name" prop="firstName">
          <el-input v-model="form.firstName"></el-input>
        </el-form-item>

        <el-form-item label="Last Name" prop="lastName">
          <el-input v-model="form.lastName"></el-input>
        </el-form-item>

        <el-form-item label="Roles" prop="roles">
          <el-select
            v-model="form.roles"
            multiple
            filterable
            placeholder="Select Roles"
            style="width: 100%"
          >
            <el-option v-for="role in allRoles.results" :key="role.name" :value="role.name">
              {{ role.name }}
            </el-option>
          </el-select>
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
              v-if="$can('internal:user:create')"
              type="primary"
              :disabled="loading > 0"
              native-type="submit"
              @click.prevent="submit"
            >
              Create User
            </el-button>
          </el-row>
        </el-form-item>
      </el-form>
    </div>
  </fragment>
</template>

<script lang="ts">
import { User } from '@dockite/database';
import { Form } from 'element-ui';
import { Component, Vue, Ref } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import { ManyResultSet, AllRolesResultItem } from '~/common/types';
import * as data from '~/store/data';
import * as user from '~/store/user';

type UserForm = Omit<
  User,
  | 'id'
  | 'apiKeys'
  | 'createdAt'
  | 'updatedAt'
  | 'normalizedScopes'
  | 'handleNormalizeScopes'
  | 'verified'
>;

@Component({
  components: {
    Fragment,
  },
})
export default class CreateUserPage extends Vue {
  public loading = 0;

  public form: UserForm = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    roles: [],
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

  get initialFormState(): UserForm {
    return {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      roles: [],
      scopes: [],
    };
  }

  get formRules(): object {
    const $t = this.$t.bind(this);

    return {
      email: [
        {
          required: true,
          type: 'email',
          message: $t('validationMessages.required', ['Email']),
          trigger: 'blur',
        },
      ],
      password: [
        {
          required: true,
          message: $t('validationMessages.required', ['Password']),
          trigger: 'blur',
        },
      ],
      firstName: [
        {
          required: true,
          message: $t('validationMessages.required', ['First Name']),
          trigger: 'blur',
        },
      ],
      lastName: [
        {
          required: true,
          message: $t('validationMessages.required', ['Last Name']),
          trigger: 'blur',
        },
      ],
      roles: [
        {
          type: 'array',
          min: 0,
          message: $t('validationMessages.required', ['User Roles']),
          trigger: 'blur',
        },
      ],
      scopes: [
        {
          type: 'array',
          min: 0,
          message: $t('validationMessages.required', ['User Scopes']),
          trigger: 'blur',
        },
      ],
    };
  }

  public async submit(): Promise<void> {
    try {
      this.loading += 1;

      await this.formRef.validate();

      await this.$store.dispatch(`${user.namespace}/createUser`, {
        ...this.form,
      });

      this.$message({
        message: 'User created successfully',
        type: 'success',
      });

      this.$router.push('/settings/users');
    } catch (err) {
      console.log(err);
      this.$message({
        message: 'Unable to create user, please ensure that the details are correct and try again.',
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
.dockite-create-user-page {
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
