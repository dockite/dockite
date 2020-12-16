/* eslint-disable no-param-reassign */
import { App } from 'vue';

export const defineGlobals = (vueApp: App): void => {
  vueApp.config.globalProperties.$layout = 'Default';
};

export default defineGlobals;
