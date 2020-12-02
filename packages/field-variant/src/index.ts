import { DockiteField } from '@dockite/field';
import { Field, FieldIOContext, HookContextWithOldData, HookContext, Schema } from '@dockite/types';
import {
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLUnionType,
} from 'graphql';
import GraphQLUnionInputType from '@dockite/union-input';

type ChildField = Omit<Field, 'id' | 'schema' | 'schemaId' | 'dockiteField'>;

export class DockiteFieldVariant extends DockiteField {
  public static type = 'variant';

  public static title = 'Variant';

  public static description = 'A variant field';

  public static defaultOptions = {};

  private getMappedChildFields(): Omit<Field, 'id'>[] {
    const staticFields = Object.values(this.fieldManager);

    return (this.schemaField.settings.children ?? []).map(
      (child: ChildField): Omit<Field, 'id'> => {
        const mappedChild: Omit<Field, 'id'> = {
          ...child,
          schemaId: this.schemaField.id,
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

  public async inputType(ctx: FieldIOContext): Promise<GraphQLInputType> {
    // Then map each child to corresponding field type
    const childFields: Omit<Field, 'id'>[] = this.getMappedChildFields();

    // Next construct the fields for the GraphQLInputObjectType
    const inputObjectTypeMap: Record<string, GraphQLInputObjectType> = {};

    // Then for each child field gather their input type and assign the field
    // to the GraphQLInputObjectType
    await Promise.all(
      childFields.map(async child => {
        if (!child.dockiteField) {
          throw new Error(`dockiteFiled failed to map for ${this.schemaField.name}.${child.name}`);
        }

        const inputType = await child.dockiteField.inputType(ctx);

        if (inputType !== null) {
          inputObjectTypeMap[child.name] = new GraphQLInputObjectType({
            name: `${this.schemaField?.schema?.name ?? 'Unknown'}${this.schemaField.name}Variant${
              child.name
            }InputType`,
            fields: {
              [child.name]: {
                type: inputType,
              },
            },
          });
        }
      }),
    );

    return GraphQLUnionInputType({
      name: `${this.schemaField?.schema?.name ?? 'Unknown'}${
        this.schemaField.name
      }VariantInputType`,
      inputTypes: Object.values(inputObjectTypeMap),
      typeKey: '__inputName',
      resolveType(name: string) {
        return inputObjectTypeMap[name];
      },
    });
  }

  public async processInput<T>(ctx: HookContextWithOldData): Promise<T> {
    const childFields = this.getMappedChildFields();

    await Promise.all(
      childFields.map(async child => {
        if (!child.dockiteField) {
          throw new Error(`dockiteFiled failed to map for ${this.schemaField.name}.${child.name}`);
        }

        const oldData = (ctx.oldData ?? {})[this.schemaField.name];

        if (ctx.data[this.schemaField.name] && ctx.data[this.schemaField.name][child.name]) {
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
        }
      }),
    );

    return (ctx.data[this.schemaField.name] as any) as T;
  }

  public async outputType(ctx: FieldIOContext): Promise<GraphQLOutputType> {
    // Then map each child to corresponding field type
    const childFields: Omit<Field, 'id'>[] = this.getMappedChildFields();

    // Next construct a collection of output types
    const outputTypeCollection: GraphQLObjectType[] = [];

    // Then for each child field create an output type and add it
    // to the collection.
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
          outputTypeCollection.push(
            new GraphQLObjectType({
              name: `${this.schemaField?.schema?.name ?? 'Unknown'}${this.schemaField.name}Variant${
                child.name
              }`,
              fields: {
                [child.name]: {
                  type: outputType,
                  args: outputArgs,
                  resolve: async (data: Record<string, any>, args, gqlCtx): Promise<any> => {
                    const fieldData = data[child.name];

                    const field = { ...child, id: 'child' };

                    return dockiteField.processOutputGraphQL<any>({
                      field,
                      fieldData,
                      data,
                      args,
                      user: gqlCtx.user,
                    });
                  },
                },
              },
              // This works due to there only being 1 top level property in the
              // object that isTypeOf will work on, therefore it should be the same as
              // the field name.
              isTypeOf(value: any) {
                console.log('variant isTypeOf', { value });
                const [name] = Object.keys(value);

                return name === child.name;
              },
            }),
          );
        }
      }),
    );

    return new GraphQLUnionType({
      name: `${this.schemaField?.schema?.name ?? 'Unknown'}${this.schemaField.name}Variant`,
      types: outputTypeCollection,
    });
  }

  public async processOutput<T>(ctx: HookContext): Promise<T> {
    const childFields = this.getMappedChildFields();

    await Promise.all(
      childFields.map(async child => {
        if (!child.dockiteField) {
          throw new Error(`dockiteFiled failed to map for ${this.schemaField.name}.${child.name}`);
        }

        if (ctx.data[this.schemaField.name] && ctx.data[this.schemaField.name][child.name]) {
          const childCtx: HookContextWithOldData = {
            ...ctx,
            data: ctx.data[this.schemaField.name],
            fieldData: ctx.data[this.schemaField.name][child.name],
            field: child as Field,
          };

          ctx.data[this.schemaField.name][child.name] = await child.dockiteField.processOutput(
            childCtx,
          );
        }
      }),
    );

    return (ctx.data[this.schemaField.name] as any) as T;
  }

  public async validateInputGraphQL(ctx: HookContextWithOldData): Promise<void> {
    const childFields = this.getMappedChildFields();

    await Promise.all(
      childFields.map(async child => {
        if (!child.dockiteField) {
          throw new Error(`dockiteFiled failed to map for ${this.schemaField.name}.${child.name}`);
        }

        const oldData = (ctx.oldData ?? {})[this.schemaField.name];
        if (ctx.data[this.schemaField.name] && ctx.data[this.schemaField.name][child.name]) {
          const childCtx: HookContextWithOldData = {
            ...ctx,
            data: ctx.data[this.schemaField.name],
            fieldData: ctx.data[this.schemaField.name][child.name],
            field: child as Field,
            oldData,
            path: `${ctx.path || this.schemaField.name}.${child.name}`,
          };

          await child.dockiteField.validateInputGraphQL(childCtx);
        }
      }),
    );
  }

  public async validateInputRaw(ctx: HookContextWithOldData): Promise<void> {
    const childFields = this.getMappedChildFields();

    await Promise.all(
      childFields.map(async child => {
        if (!child.dockiteField) {
          throw new Error(`dockiteFiled failed to map for ${this.schemaField.name}.${child.name}`);
        }

        const oldData = (ctx.oldData ?? {})[this.schemaField.name];
        if (ctx.data[this.schemaField.name] && ctx.data[this.schemaField.name][child.name]) {
          const childCtx: HookContextWithOldData = {
            ...ctx,
            data: ctx.data[this.schemaField.name],
            fieldData: ctx.data[this.schemaField.name][child.name],
            field: child as Field,
            oldData,
            path: `${ctx.path || this.schemaField.name}.${child.name}`,
          };

          await child.dockiteField.validateInputRaw(childCtx);
        }
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

        if (ctx.data[this.schemaField.name] && ctx.data[this.schemaField.name][child.name]) {
          const childCtx: HookContextWithOldData = {
            ...ctx,
            data: ctx.data[this.schemaField.name],
            fieldData: ctx.data[this.schemaField.name][child.name],
            field: child as Field,
          };

          await child.dockiteField.onCreate(childCtx);
        }
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

        if (ctx.data[this.schemaField.name] && ctx.data[this.schemaField.name][child.name]) {
          const childCtx: HookContextWithOldData = {
            ...ctx,
            data: ctx.data[this.schemaField.name],
            fieldData: ctx.data[this.schemaField.name][child.name],
            field: child as Field,
            oldData,
          };

          await child.dockiteField.onUpdate(childCtx);
        }
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

        if (ctx.data[this.schemaField.name] && ctx.data[this.schemaField.name][child.name]) {
          const childCtx: HookContextWithOldData = {
            ...ctx,
            data: ctx.data[this.schemaField.name],
            fieldData: ctx.data[this.schemaField.name][child.name],
            field: child as Field,
          };

          await child.dockiteField.onSoftDelete(childCtx);
        }
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

        if (ctx.data[this.schemaField.name] && ctx.data[this.schemaField.name][child.name]) {
          const childCtx: HookContextWithOldData = {
            ...ctx,
            data: ctx.data[this.schemaField.name],
            fieldData: ctx.data[this.schemaField.name][child.name],
            field: child as Field,
          };

          await child.dockiteField.onPermanentDelete(childCtx);
        }
      }),
    );
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
