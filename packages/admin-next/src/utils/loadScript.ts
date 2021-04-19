/**
 *
 */
export const loadScript = (
  src: string,
  integrity?: string,
  crossOrigin?: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof document !== 'undefined') {
      const match = document.querySelector(`script[src='${src}']`);

      if (match) {
        return resolve();
      }

      const script = document.createElement('script');

      script.onload = () => resolve();
      script.onerror = () => reject();

      script.async = true;
      script.defer = true;

      if (integrity) {
        script.integrity = integrity;
      }

      if (crossOrigin) {
        script.crossOrigin = crossOrigin;
      }

      script.src = src;

      document.body.appendChild(script);
    } else {
      reject(new Error('Unable to load script'));
    }
  });
};

export default loadScript;
