import { Middleware } from '@nuxt/types';

const authorized: Middleware = ({ route, redirect, app }) => {
  if (process.client) {
    let meta = route.meta ?? {};

    if (Array.isArray(meta)) {
      if (meta.length > 0) {
        // Get the last item in a non-mutating fashion
        meta = meta[meta.length - 1];
      } else {
        meta = {};
      }
    }

    if (meta.can) {
      let { can } = meta;

      if (!Array.isArray(can)) {
        can = [can];
      }

      if (!app.$can(...can)) {
        return redirect(403, '/403');
      }
    }
  }
};

export default authorized;
