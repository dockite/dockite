import { DockiteField } from '@dockite/field';
import {
  GraphQLInputType,
  GraphQLOutputType,
  GraphQLScalarType,
  GraphQLString,
  GraphQLList,
} from 'graphql';
import { HookContext, DockiteFieldValidationError } from '@dockite/types';

import { SelectFieldSettings } from './types';

const DockiteFieldSelectType = new GraphQLScalarType({
  ...GraphQLString.toConfig(),
  name: 'DockiteFieldSelect',
});

export class DockiteFieldSelect extends DockiteField {
  public static type = 'select';

  public static title = 'Select';

  public static description =
    'A multiple choice field rendered as a select element. Supports both single and multiple values.';

  public static defaultOptions: SelectFieldSettings = {
    required: false,
    multiple: false,
    options: [],
  };

  public async inputType(): Promise<GraphQLInputType> {
    if (this.schemaField.settings.multiple) {
      return new GraphQLList(DockiteFieldSelectType);
    }

    return DockiteFieldSelectType;
  }

  public async validateInput(ctx: HookContext): Promise<void> {
    const settings = this.schemaField.settings as SelectFieldSettings;

    let input: string | string[] = ctx.fieldData;

    if (!input && !settings.required) {
      return;
    }

    if (!Array.isArray(input)) {
      input = [input];
    }

    if (input.length === 0 && !settings.required) {
      return;
    }

    const invalid = input.some(i => !settings.options.map(x => x.value).includes(i));

    if (invalid) {
      throw new DockiteFieldValidationError(
        'SEL_INVALID_ITEMS',
        `${this.schemaField.title} contains invalid items`,
        ctx.path || this.schemaField.name,
      );
    }
  }

  public async outputType(): Promise<GraphQLOutputType> {
    if (this.schemaField.settings.multiple) {
      return new GraphQLList(DockiteFieldSelectType);
    }

    return DockiteFieldSelectType;
  }
}
