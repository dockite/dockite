import { Plugin } from '@nuxt/types';
import Vue, { Component } from 'vue';

window.$Vue = Vue;

export interface DockiteFieldManager {
  [name: string]: {
    input: Component;
    settings: Component;
    view: Component | null;
  };
}

const fieldManager: DockiteFieldManager = {};

const registerField = (
  name: string,
  inputComponent: Component,
  settingsComponent: Component,
  viewComponent: Component | null = null,
): void => {
  if (!fieldManager[name]) {
    fieldManager[name] = {
      input: inputComponent,
      settings: settingsComponent,
      view: viewComponent,
    };
  }
};

const plugin: Plugin = async (_, inject) => {
  const win = window as any; // eslint-disable-line

  if (!win.dockite) {
    win.dockite = {};
  }

  if (!win.dockite.fieldManager) {
    win.dockite.fieldManager = fieldManager;
  }

  if (!win.dockite.registerField || typeof win.dockite.registerField !== 'function') {
    win.dockite.registerField = registerField;
  }

  await Promise.all(win.dockiteResolveFields);

  inject('dockiteFieldManager', win.dockite.fieldManager);
};

export default plugin;
