import { Locale } from '@dockite/database';

export interface ApplicationState {
  locale: Locale;
}

export type MutatorSourceFn<TPayload> = (state: ApplicationState, payload: TPayload) => void;

export type MutatorFn<TPayload> = (payload: TPayload) => void;
