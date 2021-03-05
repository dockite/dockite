import { reactive, onUnmounted, getCurrentInstance } from 'vue';

type MaybeArray<T> = T | Array<T>;

const portals: Record<string, MaybeArray<JSX.Element>> = reactive({});

interface UsePortalHook {
  getPortal: (name: string) => MaybeArray<JSX.Element> | null;
  setPortal: (name: string, content: MaybeArray<JSX.Element>) => void;
}

export const usePortal = (): UsePortalHook => {
  const getPortal = (name: string): MaybeArray<JSX.Element> | null => {
    const target = portals[name];

    if (typeof target === 'function') {
      return target();
    }

    return target ?? null;
  };

  const setPortal = (name: string, content: MaybeArray<JSX.Element>): void => {
    if (portals[name]) {
      delete portals[name];
    }

    portals[name] = content;

    const instance = getCurrentInstance();

    if (instance) {
      onUnmounted(() => {
        delete portals[name];
      });
    }
  };

  return { getPortal, setPortal };
};

export default usePortal;
