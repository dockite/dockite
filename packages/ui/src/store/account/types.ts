export interface AccountState {
  authenticated: boolean;
  user: Record<string, any> | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}
