import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';

import notAuthorizedSvg from '../assets/images/not-authorized.svg';

type NotAuthorizedPageProps = never;

export const NotAuthorizedPage = defineComponent({
  name: 'NotAuthorizedPageComponent',

  setup: () => {
    const router = useRouter();

    router.replace({ path: '/403' });

    return () => (
      <div class="flex-1 h-full flex flex-col justify-center items-center py-12">
        <img style="max-width: 175px" src={notAuthorizedSvg} />

        <h1 class="text-2xl font-semibold pt-5">403: Not Authorized</h1>

        <p class="pt-3">You are not authorized to view the requested page.</p>

        <router-link to="/">Return Home?</router-link>
      </div>
    );
  },
});

export default NotAuthorizedPage;
