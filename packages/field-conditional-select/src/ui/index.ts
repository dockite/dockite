/* eslint-disable */
import { registerField } from '@dockite/field';

import Input from './Input.vue';
import Settings from './Settings.vue';
import View from './View.vue';

export default registerField('conditional_select', Input, Settings, View);
