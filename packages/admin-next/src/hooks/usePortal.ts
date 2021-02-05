import { reactive, onUnmounted, getCurrentInstance } from 'vue';

type MaybeArray<T> = T | Array<T>;

const portals: Record<string, MaybeArray<JSX.Element>> = reactive({});

interface UsePortalHook {
  getPortal: (name: string) => MaybeArray<JSX.Element> | null;
  setPortal: (name: string, content: MaybeArray<JSX.Element>) => void;
}

export const usePortal = (): UsePortalHook => {
  const getPortal = (name: string): MaybeArray<JSX.Element> | null => {
    return portals[name] ?? null;
  };

  const setPortal = (name: string, content: MaybeArray<JSX.Element>): void => {
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
