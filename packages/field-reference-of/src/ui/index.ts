import { registerField } from '@dockite/field';

import { FIELD_TYPE } from '../types';

import { InputComponent } from './Input';
import { SettingsComponent } from './Settings';

export default registerField(FIELD_TYPE, InputComponent, SettingsComponent);
