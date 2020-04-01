import { Component } from 'vue';

export interface FieldManager {
  [name: string]: {
    input: Component;
    settings: Component;
  };
}

export const fieldManager: FieldManager = {};

export const registerField = (
  name: string,
  inputComponent: Component,
  settingsComponent: Component,
) => {
  if (!fieldManager[name]) {
    fieldManager[name] = {
      input: inputComponent,
      settings: settingsComponent,
    };
  }
};

export const bootstrap = () => {
  const w = window as any; // eslint-disable-line

  if (!w.dockite) {
    w.dockite = {};
  }

  if (!w.dockite.fieldManager) {
    w.dockite.fieldManager = fieldManager;
  }

  if (!w.dockite.registerField || typeof w.dockite.registerField !== 'function') {
    w.dockite.registerField = registerField;
  }
};

export default bootstrap;
