/* eslint-disable no-param-reassign */
import { Field, Schema } from '@dockite/database';
import { DockiteField } from '@dockite/field';
import {
  FieldIOContext,
  GlobalContext,
  HookContext,
  HookContextWithOldData,
  DockiteFieldValidationError,
  FieldContext,
} from '@dockite/types';
import {
  GraphQLFieldConfigMap,
  GraphQLInputFieldConfigMap,
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLOutputType,
  Source,
} from 'graphql';
import { merge, get } from 'lodash';

import { ChildField, GroupFieldSettings, ProcessMethodType, FieldHookMethod } from './types';

export class DockiteFieldGroup extends DockiteField {
  public static type = 'group';

  public static title = 'Group';

  public static description = 'A group field';

  public static defaultOptions: GroupFieldSettings = {
    required: false,
    repeatable: false,
    minRows: 0,
    maxRows: Infinity,
    multipleOf: 1,
    children: [],
  };

  public defaultValue() {
    const settings = this.schemaField.settings as GroupFieldSettings;

    if (settings.repeatable) {
      return [];
    }

    return null;
  }

  private makeInitialFieldData(fields: Omit<Field, 'id'>[]): Record<string, any> {
    return fields.reduce((acc, curr) => {
      return {
        ...acc,
        [curr.name]:
          curr.settings.default !== undefined
            ? curr.settings.default
            : curr.dockiteField?.defaultValue(),
      };
    }, {});
  }

  private getMappedChildFields(): Omit<Field, 'id'>[] {
    const staticFields = Object.values(this.fieldManager);

    return (this.schemaField.settings.children ?? []).map(
      (child: ChildField): Omit<Field, 'id' | 'setDockiteField'> => {
        const mappedChild: Omit<Field, 'id' | 'setDockiteField'> = {
          ...child,
          schemaId: this.schemaField.schemaId,
          schema: {
            ...(this.schemaField.schema as Schema),
            name: `${this.schemaField.schema?.name}_${this.schemaField.name}`,
          },
        };

        const FieldClass = staticFields.find(staticField => staticField.type === child.type);

        if (FieldClass) {
          mappedChild.dockiteField = new FieldClass(
            mappedChild as Field,
            this.orm,
            this.fieldManager,
            this.graphqlSchemas,
          );
        }

        return mappedChild;
      },
    );
  }

  public async handleProcessField<T>(
    ctx: HookContextWithOldData | FieldContext,
    type: ProcessMethodType,
  ): Promise<T> {
    const childFields = this.getMappedChildFields();

    const settings = this.schemaField.settings as GroupFieldSettings;

    // Handle missing data with initial values
    if (!ctx.data[this.schemaField.name]) {
      if (settings.repeatable) {
        ctx.data[this.schemaField.name] = [];
      } else {
        ctx.data[this.schemaField.name] = this.makeInitialFieldData(childFields);
      }
    }

    // If we already have data, merge it with initial values incase the shape has changed
    if (settings.repeatable && Array.isArray(ctx.data[this.schemaField.name])) {
      ctx.data[this.schemaField.name].forEach((_: any, i: number): void => {
        ctx.data[this.schemaField.name][i] = merge(
          this.makeInitialFieldData(childFields),
          ctx.data[this.schemaField.name][i],
        );
      });
    } else {
      ctx.data[this.schemaField.name] = merge(
        this.makeInitialFieldData(childFields),
        ctx.data[this.schemaField.name],
      );
    }

    let items = ctx.fieldData;
    let repeatable = true;

    if (!Array.isArray(items)) {
      repeatable = false;
      items = [ctx.fieldData];
    }

    await Promise.all(
      items.map(async (_: never, i: number) => {
        await Promise.all(
          childFields.map(async child => {
            if (!child.dockiteField) {
              throw new Error(
                `dockiteField failed to map for ${this.schemaField.name}.${child.name}`,
              );
            }

            let oldData = get((ctx as any).oldData, this.schemaField.name);

            if (repeatable) {
              oldData = get(oldData, i);
            }

            let path = `${ctx.path}.${child.name}`;

            if (repeatable) {
              path = `${ctx.path}.${i}.${child.name}`;
            }

            // eslint-disable-next-line
            const childPath = `${this.schemaField.name}${repeatable && `[${i}]`}${`.${child.name}`}`;

            const childCtx: HookContextWithOldData & FieldContext = {
              ...ctx,
              data: get(ctx.data, `${this.schemaField.name}${repeatable && `[${i}]`}`, {}),
              fieldData: get(ctx.data, childPath, null),
              field: child as Field,
              oldData,
              path,
            };

            if (get(ctx.data, childPath)) {
              let parent = ctx.data[this.schemaField.name];

              if (repeatable) {
                parent = parent[i];
              }

              switch (type) {
                case ProcessMethodType.INPUT_GRAPHQL:
                  parent[child.name] = await child.dockiteField.processInputGraphQL(childCtx);
                  break;

                case ProcessMethodType.INPUT_RAW:
                  parent[child.name] = await child.dockiteField.processInputRaw(childCtx);
                  break;

                case ProcessMethodType.OUTPUT_GRAPHQL:
                  parent[child.name] = await child.dockiteField.processOutputGraphQL(childCtx);
                  break;

                case ProcessMethodType.OUTPUT_RAW:
                  parent[child.name] = await child.dockiteField.processOutputRaw(childCtx);
                  break;

                default:
                  break;
              }
            }
          }),
        );
      }),
    );

    return (ctx.data[this.schemaField.name] as any) as T;
  }

  public async handleFieldHook(
    ctx: HookContextWithOldData,
    method: FieldHookMethod,
  ): Promise<void> {
    const childFields = this.getMappedChildFields();
    // const settings = this.schemaField.settings as GroupFieldSettings;

    let items = get(ctx.data, this.schemaField.name);
    let repeatable = true;

    if (!Array.isArray(items)) {
      items = [items];
      repeatable = false;
    }

    await Promise.all(
      items.map(async (_: never, i: number) => {
        await Promise.all(
          childFields.map(async child => {
            if (!child.dockiteField) {
              throw new Error(
                `dockiteFiled failed to map for ${this.schemaField.name}.${child.name}`,
              );
            }

            let oldData = get((ctx as any).oldData, this.schemaField.name);

            if (repeatable) {
              oldData = get(oldData, i);
            }

            let path = `${ctx.path}.${child.name}`;

            if (repeatable) {
              path = `${ctx.path}.${i}.${child.name}`;
            }

            // eslint-disable-next-line
            const childPath = `${this.schemaField.name}${repeatable && `[${i}]`}${`.${child.name}`}`;

            const childCtx: HookContextWithOldData = {
              ...ctx,
              data: get(ctx.data, `${this.schemaField.name}${repeatable && `[${i}]`}`, {}),
              fieldData: get(ctx.data, childPath, null),
              field: child as Field,
              path,
              oldData,
            };

            if (get(ctx.data, childPath)) {
              await child.dockiteField[method](childCtx);
            }
          }),
        );
      }),
    );
  }

  public async inputType(ctx: FieldIOContext): Promise<GraphQLInputType> {
    // Then map each child to corresponding field type
    const childFields: Omit<Field, 'id'>[] = this.getMappedChildFields();

    // Next construct the fields for the GraphQLInputObjectType
    const inputTypeConfigMap: GraphQLInputFieldConfigMap = {};

    // Then for each child field gather their input type and assign the field
    // to the GraphQLInputObjectType
    await Promise.all(
      childFields.map(async child => {
        if (!child.dockiteField) {
          throw new Error(`dockiteFiled failed to map for ${this.schemaField.name}.${child.name}`);
        }

        const inputType = await child.dockiteField.inputType(ctx);

        if (inputType !== null) {
          inputTypeConfigMap[child.name] = {
            type: GraphQLNonNull(inputType),
          };
        }
      }),
    );

    // Finally construct and return the GraphQLInputObjectType
    const objectType = new GraphQLInputObjectType({
      name: `${this.schemaField.schema?.name ?? 'Unknown'}${this.schemaField.name}InputType`,
      fields: inputTypeConfigMap,
    });

    if (this.schemaField.settings.repeatable) {
      return new GraphQLList(objectType);
    }

    return objectType;
  }

  public async outputType(ctx: FieldIOContext): Promise<GraphQLOutputType> {
    // Then map each child to corresponding field type
    const childFields: Omit<Field, 'id'>[] = this.getMappedChildFields();

    // Next construct the fields for the GraphQLObjectType
    const outputTypeConfigMap: GraphQLFieldConfigMap<Source, GlobalContext> = {};

    // Then for each child field gather their input type and assign the field
    // to the GraphQLObjectType
    await Promise.all(
      childFields.map(async child => {
        if (!child.dockiteField) {
          throw new Error(`dockiteFiled failed to map for ${this.schemaField.name}.${child.name}`);
        }

        const { dockiteField } = child;

        const [outputType, outputArgs] = await Promise.all([
          dockiteField.outputType(ctx),
          dockiteField.outputArgs(),
        ]);

        if (outputType !== null) {
          outputTypeConfigMap[child.name] = {
            type: outputType,
            args: outputArgs,
            resolve: async (data: Record<string, any>, args): Promise<any> => {
              const fieldData = data[child.name];

              const field = { ...child, id: 'child' };

              if (fieldData !== undefined) {
                return dockiteField.processOutputGraphQL<any>({
                  field,
                  fieldData,
                  data,
                  args,
                });
              }

              return null;
            },
          };
        }
      }),
    );

    // Finally construct and return the GraphQLObjectType
    const objectType = new GraphQLObjectType({
      name: `${this.schemaField.schema?.name ?? 'Unknown'}${this.schemaField.name}`,
      fields: outputTypeConfigMap,
    });

    if (this.schemaField.settings.repeatable) {
      return new GraphQLList(objectType);
    }

    return objectType;
  }

  public processInputRaw<T extends any>(ctx: HookContextWithOldData): Promise<T> {
    return this.handleProcessField(ctx, ProcessMethodType.INPUT_RAW);
  }

  public processInputGraphQL<T extends any>(ctx: FieldContext): Promise<T> {
    return this.handleProcessField(ctx, ProcessMethodType.INPUT_GRAPHQL);
  }

  public processOutputRaw<T extends any>(ctx: HookContext): Promise<T> {
    return this.handleProcessField(ctx, ProcessMethodType.OUTPUT_RAW);
  }

  public async processOutputGraphQL<T extends any>(ctx: FieldContext): Promise<T> {
    // return this.handleProcessField(ctx, ProcessMethodType.OUTPUT_GRAPHQL);

    return (ctx.fieldData as any) as T;
  }

  public async validateInputRaw(ctx: HookContextWithOldData): Promise<void> {
    const childFields = this.getMappedChildFields();
    const settings = this.schemaField.settings as GroupFieldSettings;

    const errors: DockiteFieldValidationError[] = [];

    if (settings.repeatable && Array.isArray(ctx.fieldData)) {
      await Promise.all(
        ctx.fieldData.map(async (_, i) => {
          await Promise.all(
            childFields.map(async child => {
              if (!child.dockiteField) {
                throw new Error(
                  `dockiteFiled failed to map for ${this.schemaField.name}.${child.name}`,
                );
              }

              const oldData = ((ctx.oldData ?? {})[this.schemaField.name] ?? [])[i];

              const childCtx: HookContextWithOldData = {
                ...ctx,
                data: ctx.data[this.schemaField.name][i],
                fieldData: ctx.data[this.schemaField.name][i][child.name],
                field: child as Field,
                oldData,
                path: `${ctx.path || ''}.${i}.${child.name}`,
              };

              //
              if (ctx.data[this.schemaField.name][i][child.name] !== undefined) {
                await child.dockiteField.validateInputRaw(childCtx).catch(err => {
                  if (err instanceof DockiteFieldValidationError) {
                    errors.push(err);
                  }
                });
              }
            }),
          );
        }),
      );
    } else {
      await Promise.all(
        childFields.map(async child => {
          if (!child.dockiteField) {
            throw new Error(
              `dockiteFiled failed to map for ${this.schemaField.name}.${child.name}`,
            );
          }

          const oldData = (ctx.oldData ?? {})[this.schemaField.name];

          const childCtx: HookContextWithOldData = {
            ...ctx,
            data: ctx.data[this.schemaField.name],
            fieldData: ctx.data[this.schemaField.name][child.name],
            field: child as Field,
            oldData,
            path: `${ctx.path || ''}.${child.name}`,
          };

          //
          if (ctx.data[this.schemaField.name][child.name] !== undefined) {
            await child.dockiteField.validateInputRaw(childCtx).catch(err => {
              if (err instanceof DockiteFieldValidationError) {
                errors.push(err);
              }
            });
          }
        }),
      );
    }

    if (errors.length > 0) {
      errors.forEach(e => {
        if (e.children) {
          errors.push(...e.children);
        }
      });

      throw new DockiteFieldValidationError(
        'INVALID_CHILDREN',
        `${this.schemaField.title} has child fields that have failed validation`,
        ctx.path || this.schemaField.name,
        errors,
      );
    }
  }

  public async validateInputGraphQL(ctx: HookContextWithOldData): Promise<void> {
    const childFields = this.getMappedChildFields();
    const settings = this.schemaField.settings as GroupFieldSettings;

    if (settings.repeatable && Array.isArray(ctx.fieldData)) {
      await Promise.all(
        ctx.fieldData.map(async (_, i) => {
          await Promise.all(
            childFields.map(async child => {
              if (!child.dockiteField) {
                throw new Error(
                  `dockiteFiled failed to map for ${this.schemaField.name}.${child.name}`,
                );
              }

              const oldData = ((ctx.oldData ?? {})[this.schemaField.name] ?? [])[i];

              const childCtx: HookContextWithOldData = {
                ...ctx,
                data: ctx.data[this.schemaField.name][i],
                fieldData: ctx.data[this.schemaField.name][i][child.name],
                field: child as Field,
                oldData,
              };

              //
              if (ctx.data[this.schemaField.name][i][child.name] !== undefined) {
                await child.dockiteField.validateInputGraphQL(childCtx);
              }
            }),
          );
        }),
      );
    } else {
      await Promise.all(
        childFields.map(async child => {
          if (!child.dockiteField) {
            throw new Error(
              `dockiteFiled failed to map for ${this.schemaField.name}.${child.name}`,
            );
          }

          const oldData = (ctx.oldData ?? {})[this.schemaField.name];

          const childCtx: HookContextWithOldData = {
            ...ctx,
            data: ctx.data[this.schemaField.name],
            fieldData: ctx.data[this.schemaField.name][child.name],
            field: child as Field,
            oldData,
          };

          //
          if (ctx.data[this.schemaField.name][child.name] !== undefined) {
            await child.dockiteField.validateInputGraphQL(childCtx);
          }
        }),
      );
    }
  }

  public onCreate(ctx: HookContext): Promise<void> {
    return this.handleFieldHook(ctx, 'onCreate');
  }

  public onUpdate(ctx: HookContext): Promise<void> {
    return this.handleFieldHook(ctx, 'onUpdate');
  }

  public onSoftDelete(ctx: HookContext): Promise<void> {
    return this.handleFieldHook(ctx, 'onSoftDelete');
  }

  public onPermanentDelete(ctx: HookContext): Promise<void> {
    return this.handleFieldHook(ctx, 'onPermanentDelete');
  }

  public async onFieldCreate(): Promise<void> {
    const childFields = this.getMappedChildFields();

    await Promise.all(
      childFields.map(async child => {
        if (!child.dockiteField) {
          throw new Error(`dockiteFiled failed to map for ${this.schemaField.name}.${child.name}`);
        }

        await child.dockiteField.onFieldCreate();
      }),
    );
  }

  public async onFieldUpdate(): Promise<void> {
    const childFields = this.getMappedChildFields();

    await Promise.all(
      childFields.map(async child => {
        if (!child.dockiteField) {
          throw new Error(`dockiteFiled failed to map for ${this.schemaField.name}.${child.name}`);
        }

        await child.dockiteField.onFieldUpdate();
      }),
    );
  }
}
