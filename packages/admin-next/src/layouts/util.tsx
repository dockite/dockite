import { defineAsyncComponent } from 'vue';

export const getLayoutComponent = (layout: string): any => {
  return defineAsyncComponent(() => {
    if (layout === 'Dashboard') {
      return import('./Dashboard');
    }

    if (layout === 'Guest') {
      return import('./Guest');
    }

    return import('./Default');
  });
};

export default getLayoutComponent;
