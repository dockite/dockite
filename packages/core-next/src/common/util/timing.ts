import { performance } from 'perf_hooks';

type StopTimingFn = () => string;

/**
 * Starts a timer and then returns a method to stop the timer which will then
 * return the elapsed duration in milliseconds up to 2 decimal places.
 */
export const startTiming = (): StopTimingFn => {
  const start = performance.now();

  return () => {
    const stop = performance.now();

    return (stop - start).toFixed(2);
  };
};

export default startTiming;
