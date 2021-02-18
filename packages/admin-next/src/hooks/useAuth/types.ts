import { User } from '@dockite/database';
import { Ref } from 'vue';

import { MaybePromise } from '~/common/types';

export type AuthType = 'internal' | 'third-party';

export interface UseAuthState {
  authenticated: boolean;
  initialised: boolean;
  user: User | null;
  type: AuthType;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UseAuthHook {
  state: UseAuthState;
  token: Ref<string>;
  handleInitProvider: (...args: any) => MaybePromise<void>;
  handleLogin: (payload: LoginPayload) => MaybePromise<string | void>;
  handleRegister: (payload: RegisterPayload) => MaybePromise<string | void>;
  handleRegisterFirstUser: (payload: RegisterPayload) => MaybePromise<string | void>;
  handleRefreshToken: () => MaybePromise<void>;
  handleRefreshUser: () => MaybePromise<void>;
  handleLogout: () => MaybePromise<void>;
}
