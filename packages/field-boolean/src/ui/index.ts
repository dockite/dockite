import { registerField } from '@dockite/field';

import Input from './Input.vue';
import Settings from './Settings.vue';

export default registerField('boolean', Input, Settings);
