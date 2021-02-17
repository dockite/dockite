import { registerField } from '@dockite/field';

import { FIELD_TYPE } from '../types';

import { InputComponent } from './Input';
import { SettingsComponent } from './Settings';
import { ViewComponent } from './View';

export default registerField(FIELD_TYPE, InputComponent, SettingsComponent, ViewComponent);
