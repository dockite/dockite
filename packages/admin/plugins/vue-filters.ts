import { formatDistanceToNow } from 'date-fns';
import { startCase, camelCase, kebabCase, snakeCase } from 'lodash';
import Vue from 'vue';

Vue.filter('startCase', startCase);
Vue.filter('camelCase', camelCase);
Vue.filter('kebabCase', kebabCase);
Vue.filter('snakeCase', snakeCase);

Vue.filter('shortDesc', (value: string) => {
  if (value.length > 20) {
    return value.slice(0, 17).trim() + '...';
  }

  return value;
});

Vue.filter('startCaseUnlessUUID', (value: string) => {
  if (value.split('-').length >= 3) {
    return value;
  }

  return startCase(value);
});

Vue.filter('fromNow', (value: Date | string) =>
  formatDistanceToNow(new Date(value), { addSuffix: true }),
);

Vue.filter('toLocaleDateTime', (value: Date | string) => new Date(value).toLocaleString());
