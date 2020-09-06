/* eslint-disable no-param-reassign */
import { DockiteField } from '@dockite/field';
import {
  Field,
  FieldIOContext,
  GlobalContext,
  HookContext,
  HookContextWithOldData,
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
import { Schema } from '@dockite/database';
import { merge } from 'lodash';

import { GroupFieldSettings } from './types';

type ChildField = Omit<Field, 'id' | 'schema' | 'schemaId' | 'dockiteField'>;

export class DockiteFieldGroup extends DockiteField {
  public static type = 'group';

  public static title = 'Group';

  public static description = 'A group field';

  public static defaultOptions: GroupFieldSettings = {
    required: false,
    repeatable: false,
    minRows: 0,
    maxRows: Infinity,
    children: [],
  };

  private getMappedChildFields(): Omit<Field, 'id'>[] {
    const staticFields = Object.values(this.fieldManager);

    return (this.schemaField.settings.children ?? []).map(
      (child: ChildField): Omit<Field, 'id'> => {
        const mappedChild: Omit<Field, 'id'> = {
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
          );
        }

        return mappedChild;
      },
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

  public async processInput<T>(ctx: HookContextWithOldData): Promise<T> {
    const childFields = this.getMappedChildFields();
    const settings = this.schemaField.settings as GroupFieldSettings;

    if (!ctx.data[this.schemaField.name]) {
      if (settings.repeatable) {
        ctx.data[this.schemaField.name] = [];
      } else {
        ctx.data[this.schemaField.name] = this.makeInitialFieldData(childFields);
      }
    } else if (settings.repeatable && Array.isArray(ctx.data[this.schemaField.name])) {
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

    if (Array.isArray(ctx.fieldData)) {
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

              if (ctx.data[this.schemaField.name][i][child.name] !== undefined) {
                ctx.data[this.schemaField.name][i][
                  child.name
                ] = await child.dockiteField.processInput(childCtx);
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

          if (ctx.data[this.schemaField.name][child.name] !== undefined) {
            ctx.data[this.schemaField.name][child.name] = await child.dockiteField.processInput(
              childCtx,
            );
          }
        }),
      );
    }

    return (ctx.data[this.schemaField.name] as any) as T;
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

  public async processOutput<T>(ctx: HookContext): Promise<T> {
    const childFields = this.getMappedChildFields();

    if (Array.isArray(ctx.fieldData)) {
      await Promise.all(
        ctx.fieldData.map(async (_, i) => {
          await Promise.all(
            childFields.map(async child => {
              if (!child.dockiteField) {
                throw new Error(
                  `dockiteFiled failed to map for ${this.schemaField.name}.${child.name}`,
                );
              }

              ctx.data[this.schemaField.name][i] = ctx.data[this.schemaField.name][i] ?? {};

              const childCtx: HookContextWithOldData = {
                ...ctx,
                data: ctx.data[this.schemaField.name][i],
                fieldData: ctx.data[this.schemaField.name][i][child.name] ?? null,
                field: child as Field,
              };

              // If we have data for the property then we will continue to process output
              if (ctx.data[this.schemaField.name][i][child.name] !== undefined) {
                ctx.data[this.schemaField.name][i][
                  child.name
                ] = await child.dockiteField.processOutput(childCtx);
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

          ctx.data[this.schemaField.name] = ctx.data[this.schemaField.name] ?? {};

          const childCtx: HookContextWithOldData = {
            ...ctx,
            data: ctx.data[this.schemaField.name],
            fieldData: ctx.data[this.schemaField.name][child.name] ?? null,
            field: child as Field,
          };

          // If we have data for the property then we will continue to process
          if (ctx.data[this.schemaField.name][child.name] !== undefined) {
            ctx.data[this.schemaField.name][child.name] = await child.dockiteField.processOutput(
              childCtx,
            );
          }
        }),
      );
    }

    return (ctx.data[this.schemaField.name] as any) as T;
  }

  public async validateInput(ctx: HookContextWithOldData): Promise<void> {
    const childFields = this.getMappedChildFields();

    if (Array.isArray(ctx.fieldData)) {
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
                await child.dockiteField.validateInput(childCtx);
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
            await child.dockiteField.validateInput(childCtx);
          }
        }),
      );
    }
  }

  public async onCreate(ctx: HookContext): Promise<void> {
    const childFields = this.getMappedChildFields();

    if (Array.isArray(ctx.fieldData)) {
      await Promise.all(
        ctx.fieldData.map(async (_, i) => {
          await Promise.all(
            childFields.map(async child => {
              if (!child.dockiteField) {
                throw new Error(
                  `dockiteFiled failed to map for ${this.schemaField.name}.${child.name}`,
                );
              }

              const childCtx: HookContextWithOldData = {
                ...ctx,
                data: ctx.data[this.schemaField.name][i],
                fieldData: ctx.data[this.schemaField.name][i][child.name],
                field: child as Field,
              };

              if (ctx.data[this.schemaField.name][i][child.name] !== undefined) {
                await child.dockiteField.onCreate(childCtx);
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

          const childCtx: HookContextWithOldData = {
            ...ctx,
            data: ctx.data[this.schemaField.name],
            fieldData: ctx.data[this.schemaField.name][child.name],
            field: child as Field,
          };

          if (ctx.data[this.schemaField.name][child.name] !== undefined) {
            await child.dockiteField.onCreate(childCtx);
          }
        }),
      );
    }
  }

  public async onUpdate(ctx: HookContextWithOldData): Promise<void> {
    const childFields = this.getMappedChildFields();

    if (Array.isArray(ctx.fieldData)) {
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

              if (ctx.data[this.schemaField.name][i][child.name] !== undefined) {
                await child.dockiteField.onUpdate(childCtx);
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

          if (ctx.data[this.schemaField.name][child.name] !== undefined) {
            await child.dockiteField.onUpdate(childCtx);
          }
        }),
      );
    }
  }

  public async onSoftDelete(ctx: HookContext): Promise<void> {
    const childFields = this.getMappedChildFields();

    if (Array.isArray(ctx.fieldData)) {
      await Promise.all(
        ctx.fieldData.map(async (_, i) => {
          await Promise.all(
            childFields.map(async child => {
              if (!child.dockiteField) {
                throw new Error(
                  `dockiteFiled failed to map for ${this.schemaField.name}.${child.name}`,
                );
              }

              const childCtx: HookContextWithOldData = {
                ...ctx,
                data: ctx.data[this.schemaField.name][i],
                fieldData: ctx.data[this.schemaField.name][i][child.name],
                field: child as Field,
              };

              if (ctx.data[this.schemaField.name][i][child.name] !== undefined) {
                await child.dockiteField.onSoftDelete(childCtx);
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

          const childCtx: HookContextWithOldData = {
            ...ctx,
            data: ctx.data[this.schemaField.name],
            fieldData: ctx.data[this.schemaField.name][child.name],
            field: child as Field,
          };

          if (ctx.data[this.schemaField.name][child.name] !== undefined) {
            await child.dockiteField.onSoftDelete(childCtx);
          }
        }),
      );
    }
  }

  public async onPermanentDelete(ctx: HookContext): Promise<void> {
    const childFields = this.getMappedChildFields();

    if (Array.isArray(ctx.fieldData)) {
      await Promise.all(
        ctx.fieldData.map(async (_, i) => {
          await Promise.all(
            childFields.map(async child => {
              if (!child.dockiteField) {
                throw new Error(
                  `dockiteFiled failed to map for ${this.schemaField.name}.${child.name}`,
                );
              }

              const childCtx: HookContextWithOldData = {
                ...ctx,
                data: ctx.data[this.schemaField.name][i],
                fieldData: ctx.data[this.schemaField.name][i][child.name],
                field: child as Field,
              };

              if (ctx.data[this.schemaField.name][i][child.name] !== undefined) {
                await child.dockiteField.onPermanentDelete(childCtx);
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

          const childCtx: HookContextWithOldData = {
            ...ctx,
            data: ctx.data[this.schemaField.name],
            fieldData: ctx.data[this.schemaField.name][child.name],
            field: child as Field,
          };

          if (ctx.data[this.schemaField.name][child.name] !== undefined) {
            await child.dockiteField.onPermanentDelete(childCtx);
          }
        }),
      );
    }
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
}
