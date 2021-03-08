import { defineComponent } from 'vue';

export const HomePage = defineComponent({
  name: 'HomePageComponent',

  setup: () => {
    return () => (
      <div>
        <h1 class="pb-3 text-2xl">Home Page content coming soon</h1>
        <router-link to="/login">Login</router-link>
      </div>
    );
  },
});

export default HomePage;
