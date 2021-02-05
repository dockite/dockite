import { registerField } from '@dockite/field';

import { InputComponent } from './Input';
import { SettingsComponent } from './Settings';

export default registerField('conditional_boolean', InputComponent, SettingsComponent);
