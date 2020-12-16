import { DockiteField } from '@dockite/field';
import { GraphQLInputType, GraphQLOutputType, GraphQLScalarType, GraphQLString } from 'graphql';
import { HookContextWithOldData, DockiteFieldValidationError } from '@dockite/types';

import { StringFieldSettings, defaultOptions, FIELD_TYPE } from './types';

const DockiteFieldStringType = new GraphQLScalarType({
  ...GraphQLString.toConfig(),
  name: 'DockiteFieldString',
});

export class DockiteFieldString extends DockiteField {
  public static type = FIELD_TYPE;

  public static title = 'String';

  public static description = 'A string field';

  public static defaultOptions = defaultOptions;

  public async inputType(): Promise<GraphQLInputType> {
    return DockiteFieldStringType;
  }

  public async outputType(): Promise<GraphQLOutputType> {
    return DockiteFieldStringType;
  }

  public async validateInput(ctx: HookContextWithOldData): Promise<void> {
    const settings = ctx.field.settings as StringFieldSettings;
    const fieldData = ctx.fieldData as string | null;

    if (settings.minLen > 0) {
      if (fieldData && fieldData.length < settings.minLen) {
        throw new DockiteFieldValidationError(
          'STR_MIN_LEN',
          `${ctx.field.title} must be at least ${settings.minLen} characters`,
          ctx.path || ctx.field.name,
        );
      }
    }

    if (settings.maxLen > 0) {
      if (fieldData && fieldData.length > settings.maxLen) {
        throw new DockiteFieldValidationError(
          'STR_MAX_LEN',
          `${ctx.field.title} must be at most ${settings.maxLen} characters`,
          ctx.field.name,
        );
      }
    }

    if (settings.urlSafe) {
      const re = /^[A-Za-z0-9-_]+$/;
      if (fieldData && !re.test(fieldData)) {
        throw new DockiteFieldValidationError(
          'STR_URL_SAFE',
          `${ctx.field.title} must be only contain the following characters: [A-Za-z0-9-_]`,
          ctx.field.name,
        );
      }
    }
  }
}
