import { DockiteField } from '@dockite/field';
import { HookContext } from '@dockite/types';
import {
  GraphQLInputType,
  GraphQLList,
  GraphQLOutputType,
  GraphQLScalarType,
  GraphQLString,
} from 'graphql';

import { ConditionalSelectFieldSettings, FIELD_TYPE, defaultOptions } from './types';

const DockiteFieldConditionalSelectType = new GraphQLScalarType({
  ...GraphQLString.toConfig(),
  name: 'DockiteFieldConditionalSelect',
});

export class DockiteFieldConditionalSelect extends DockiteField {
  public static type = FIELD_TYPE;

  public static title = 'Conditional Select';

  public static description =
    'A multiple choice field rendered as a select element that hides or shows fields and groups.';

  public static defaultOptions: ConditionalSelectFieldSettings = {
    ...defaultOptions,
  };

  public async inputType(): Promise<GraphQLInputType> {
    if (this.schemaField.settings.multiple) {
      return new GraphQLList(DockiteFieldConditionalSelectType);
    }

    return DockiteFieldConditionalSelectType;
  }

  public async validateInput(ctx: HookContext): Promise<void> {
    const settings = this.schemaField.settings as ConditionalSelectFieldSettings;

    let input: string | string[] = ctx.fieldData;

    if (input === null && !settings.required) {
      return;
    }

    if (!Array.isArray(input)) {
      input = [input];
    }

    const invalid = input.some(i => !settings.options.map(x => x.value).includes(i));

    if (invalid) {
      throw new Error(`${this.schemaField.name} contains invalid items`);
    }
  }

  public async outputType(): Promise<GraphQLOutputType> {
    if (this.schemaField.settings.multiple) {
      return new GraphQLList(DockiteFieldConditionalSelectType);
    }

    return DockiteFieldConditionalSelectType;
  }
}
