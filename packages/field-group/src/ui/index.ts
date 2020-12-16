import { registerField } from '@dockite/field';

import { InputComponent } from './Input';
import { SettingsComponent } from './Settings';

export default registerField('group', InputComponent, SettingsComponent);
