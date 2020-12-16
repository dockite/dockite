import { getCurrentInstance } from 'vue';

export const useLayout = (name: string): void => {
  const instance = getCurrentInstance();

  if (!instance) {
    return;
  }

  instance.appContext.config.globalProperties.$layout = name;
};

export default useLayout;
