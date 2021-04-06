import { computed, ref, Ref } from 'vue';

export interface UseCountdownHook {
  counter: Ref<number>;
  counterInSeconds: Ref<number>;
  startCountdown: () => void;
}

/**
 * Provides countdown functionality from a specific duration in milliseconds (default: 3000ms) with options for
 * lazy or instantaneous starting of the countdown timer.
 */
export const useCountdown = (durationInMilliseconds = 3000, lazy = false): UseCountdownHook => {
  const counter = ref(durationInMilliseconds);

  const counterInSeconds = computed(() => counter.value / 1000);

  /**
   * Starts the countdown by recursively calling itself until the timer reaches zero.
   */
  const startCountdown = (): void => {
    if (counter.value > 0) {
      setTimeout(() => {
        // A
        counter.value = Math.max(counter.value - 1000, 0);

        startCountdown();
      }, 1000);
    }
  };

  if (!lazy) {
    startCountdown();
  }

  return { counter, counterInSeconds, startCountdown };
};

/**
 * Calls `startCountdown` but with the lazy argument provided.
 */
export const useCountdownLazy = (durationInMilliseconds = 3000): UseCountdownHook =>
  useCountdown(durationInMilliseconds, true);

export default useCountdown;
