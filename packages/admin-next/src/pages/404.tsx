import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';

import notFoundSvg from '../assets/images/not-found.svg';

export const NotFoundPage = defineComponent({
  name: 'NotFoundPageComponent',

  setup: () => {
    const router = useRouter();

    router.replace({ path: '/404' });

    return () => (
      <div class="flex-1 h-full flex flex-col justify-center items-center py-12">
        <img style="max-width: 175px" src={notFoundSvg} />

        <h1 class="text-2xl font-semibold pt-5">404: Not Found</h1>

        <p class="pt-3">The requested page could not be found.</p>

        <router-link to="/">Return Home?</router-link>
      </div>
    );
  },
});

export default NotFoundPage;
