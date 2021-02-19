import { defineComponent } from 'vue';

export const SpinnerComponent = defineComponent(() => {
  return () => (
    <svg viewBox="25 25 50 50" class="circular">
      <circle cx="50" cy="50" r="20" fill="none" class="path"></circle>
    </svg>
  );
});

export default SpinnerComponent;
