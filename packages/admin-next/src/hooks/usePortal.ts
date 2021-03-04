import { omit } from 'lodash';
import { computed, getCurrentInstance, onBeforeUnmount, Ref, ref } from 'vue';

type MaybeArray<T> = T | Array<T>;

type Fn = () => any;

const portals = ref<Record<string, MaybeArray<JSX.Element>>>({});

interface UsePortalHook {
  getPortal: (name: string) => Ref<MaybeArray<JSX.Element> | null>;
  setPortal: (name: string, content: MaybeArray<JSX.Element> | Fn) => void;
}

export const usePortal = (): UsePortalHook => {
  const getPortal = (name: string): Ref<MaybeArray<JSX.Element> | null> => {
    return computed(() => {
      console.log('called', name);

      if (!portals.value[name]) {
        return null;
      }

      const target = portals.value[name];

      if (typeof target === 'function') {
        return target();
      }

      return target;
    });
  };

  const setPortal = (name: string, content: MaybeArray<JSX.Element> | Fn): void => {
    console.log('setting', name);
    portals.value = {
      ...portals.value,
      [name]: content,
    };

    const instance = getCurrentInstance();

    if (instance) {
      onBeforeUnmount(() => {
        portals.value = omit(portals.value, name);
      });
    }
  };

  return { getPortal, setPortal };
};

export default usePortal;
