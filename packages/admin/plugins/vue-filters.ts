import Vue from 'vue';
import { startCase, camelCase, kebabCase, snakeCase } from 'lodash';
import { formatDistanceToNow } from 'date-fns';

Vue.filter('startCase', startCase);
Vue.filter('camelCase', camelCase);
Vue.filter('kebabCase', kebabCase);
Vue.filter('snakeCase', snakeCase);

Vue.filter('fromNow', (value: Date | string) =>
  formatDistanceToNow(new Date(value), { addSuffix: true }),
);
Vue.filter('toLocaleDateTime', (value: Date | string) => new Date(value).toLocaleString());
