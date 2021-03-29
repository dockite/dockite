/* eslint-disable no-param-reassign */
import { Locale } from '@dockite/database';

import { useMutation } from '../hooks';

export const setLocale = useMutation<Locale>((state, payload) => {
  state.locale = payload;
});

export default null;
