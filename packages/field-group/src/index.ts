import { DockiteField } from '@dockite/field';
import { Field, GlobalContext, Schema, DockiteFieldStatic } from '@dockite/types';
import {
  GraphQLFieldConfig,
  GraphQLInputType,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLString,
  Source,
  GraphQLList,
} from 'graphql';
import { GraphQLJSON } from 'graphql-type-json';

interface FieldConfig<Source, Context> {
  name: string;
  config: GraphQLFieldConfig<Source, Context>;
}

export class DockiteFieldGroup extends DockiteField {
  public static type = 'group';

  public static title = 'Group';

  public static description = 'A group field';

  public static defaultOptions = {};

  public async inputType(): Promise<GraphQLInputType> {
    return GraphQLJSON;
  }

  // public async processInput<Input, Output>(data: Input): Promise<Output> {}

  public async where(): Promise<GraphQLInputType> {
    return GraphQLString;
  }

  public async outputType(
    dockiteSchemas: Schema[],
    types: Map<string, GraphQLObjectType>,
    dockiteFields: Record<string, DockiteFieldStatic>,
  ): Promise<GraphQLOutputType> {
    const fields: Omit<Field, 'id' | 'dockiteField' | 'schema' | 'schemaId'>[] =
      this.schemaField.settings.children ?? [];

    const fieldPromises = fields.map(
      async (f): Promise<null | FieldConfig<Source, GlobalContext>> => {
        const FieldClass = Object.values(dockiteFields).find(df => df.type === f.type);

        if (!FieldClass) {
          return null;
        }

        const dockiteField = new FieldClass(this.schemaField, this.repositories, this.schema);

        const [outputType, outputArgs] = await Promise.all([
          dockiteField.outputType(dockiteSchemas, types, dockiteFields),
          dockiteField.outputArgs(),
        ]);

        return {
          name: String(f.name),
          config: {
            type: outputType,
            resolve: async (root: any, args, context): Promise<any> => {
              const value = root[f.name];
              // eslint-disable-next-line
              return dockiteField.processOutput<typeof outputType>({ value, root, args, context });
            },
            args: outputArgs,
          },
        } as FieldConfig<Source, GlobalContext>;
      },
    );

    const resolvedFields = await Promise.all(fieldPromises);

    const cleanedFields = resolvedFields.filter(f => f !== null) as FieldConfig<
      Source,
      GlobalContext
    >[];

    const objectType = new GraphQLObjectType({
      name: String(this.schemaField.name),
      fields: cleanedFields.reduce((a, b) => ({ ...a, [b.name]: b.config }), {}),
    });

    if (this.schemaField.settings.repeatable) {
      return new GraphQLList(objectType);
    }

    return objectType;
  }
}
