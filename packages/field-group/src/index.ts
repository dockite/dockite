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
  };

  private getMappedChildFields(): Omit<Field, 'id'>[] {
    const staticFields = Object.values(this.fieldManager);

    return (this.schemaField.settings.children ?? []).map(
      (child: ChildField): Omit<Field, 'id'> => {
        const mappedChild: Omit<Field, 'id'> = {
          ...child,
          schemaId: this.schemaField.id,
          schema: this.schemaField.schema,
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

    await Promise.all(
      childFields.map(async child => {
        if (!child.dockiteField) {
          throw new Error(`dockiteFiled failed to map for ${this.schemaField.name}.${child.name}`);
        }

        const oldData = (ctx.oldData ?? {})[this.schemaField.name];

        const childCtx: HookContextWithOldData = {
          ...ctx,
          data: ctx.data[this.schemaField.name],
          fieldData: ctx.data[this.schemaField.name][child.name],
          field: child as Field,
          oldData,
        };

        ctx.data[this.schemaField.name][child.name] = await child.dockiteField.processInput(
          childCtx,
        );
      }),
    );

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

              return dockiteField.processOutputGraphQL<any>({
                field,
                fieldData,
                data,
                args,
              });
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

    await Promise.all(
      childFields.map(async child => {
        if (!child.dockiteField) {
          throw new Error(`dockiteFiled failed to map for ${this.schemaField.name}.${child.name}`);
        }

        const childCtx: HookContextWithOldData = {
          ...ctx,
          data: ctx.data[this.schemaField.name],
          fieldData: ctx.data[this.schemaField.name][child.name],
          field: child as Field,
        };

        ctx.data[this.schemaField.name][child.name] = await child.dockiteField.processOutput(
          childCtx,
        );
      }),
    );

    return (ctx.data[this.schemaField.name] as any) as T;
  }

  public async validateInput(ctx: HookContextWithOldData): Promise<void> {
    const childFields = this.getMappedChildFields();

    await Promise.all(
      childFields.map(async child => {
        if (!child.dockiteField) {
          throw new Error(`dockiteFiled failed to map for ${this.schemaField.name}.${child.name}`);
        }

        const oldData = (ctx.oldData ?? {})[this.schemaField.name];

        const childCtx: HookContextWithOldData = {
          ...ctx,
          data: ctx.data[this.schemaField.name],
          fieldData: ctx.data[this.schemaField.name][child.name],
          field: child as Field,
          oldData,
        };

        await child.dockiteField.validateInput(childCtx);
      }),
    );
  }

  public async onCreate(ctx: HookContext): Promise<void> {
    const childFields = this.getMappedChildFields();

    await Promise.all(
      childFields.map(async child => {
        if (!child.dockiteField) {
          throw new Error(`dockiteFiled failed to map for ${this.schemaField.name}.${child.name}`);
        }

        const childCtx: HookContextWithOldData = {
          ...ctx,
          data: ctx.data[this.schemaField.name],
          fieldData: ctx.data[this.schemaField.name][child.name],
          field: child as Field,
        };

        await child.dockiteField.onCreate(childCtx);
      }),
    );
  }

  public async onUpdate(ctx: HookContextWithOldData): Promise<void> {
    const childFields = this.getMappedChildFields();

    await Promise.all(
      childFields.map(async child => {
        if (!child.dockiteField) {
          throw new Error(`dockiteFiled failed to map for ${this.schemaField.name}.${child.name}`);
        }

        const oldData = (ctx.oldData ?? {})[this.schemaField.name];

        const childCtx: HookContextWithOldData = {
          ...ctx,
          data: ctx.data[this.schemaField.name],
          fieldData: ctx.data[this.schemaField.name][child.name],
          field: child as Field,
          oldData,
        };

        await child.dockiteField.onUpdate(childCtx);
      }),
    );
  }

  public async onSoftDelete(ctx: HookContext): Promise<void> {
    const childFields = this.getMappedChildFields();

    await Promise.all(
      childFields.map(async child => {
        if (!child.dockiteField) {
          throw new Error(`dockiteFiled failed to map for ${this.schemaField.name}.${child.name}`);
        }

        const childCtx: HookContextWithOldData = {
          ...ctx,
          data: ctx.data[this.schemaField.name],
          fieldData: ctx.data[this.schemaField.name][child.name],
          field: child as Field,
        };

        await child.dockiteField.onSoftDelete(childCtx);
      }),
    );
  }

  public async onPermanentDelete(ctx: HookContext): Promise<void> {
    const childFields = this.getMappedChildFields();

    await Promise.all(
      childFields.map(async child => {
        if (!child.dockiteField) {
          throw new Error(`dockiteFiled failed to map for ${this.schemaField.name}.${child.name}`);
        }

        const childCtx: HookContextWithOldData = {
          ...ctx,
          data: ctx.data[this.schemaField.name],
          fieldData: ctx.data[this.schemaField.name][child.name],
          field: child as Field,
        };

        await child.dockiteField.onPermanentDelete(childCtx);
      }),
    );
  }
}
