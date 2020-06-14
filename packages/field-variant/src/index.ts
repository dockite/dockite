import { DockiteField } from '@dockite/field';
import { Field, FieldIOContext, GlobalContext } from '@dockite/types';
import {
  GraphQLFieldConfig,
  GraphQLInputType,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLString,
  GraphQLUnionType,
  Source,
} from 'graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { startCase } from 'lodash';

const graphqlCase = (value: string): string => startCase(value).replace(/\s/g, '');

interface FieldConfig<Source, Context> {
  name: string;
  config: GraphQLFieldConfig<Source, Context>;
}

export class DockiteFieldVariant extends DockiteField {
  public static type = 'variant';

  public static title = 'Variant';

  public static description = 'A variant field';

  public static defaultOptions = {};

  public async inputType(): Promise<GraphQLInputType> {
    return GraphQLJSON;
  }

  // public async processInput<Input, Output>(data: Input): Promise<Output> {}

  public async where(): Promise<GraphQLInputType> {
    return GraphQLString;
  }

  public async outputType({
    dockiteSchemas,
    graphqlTypes,
    dockiteFields,
  }: FieldIOContext): Promise<GraphQLOutputType> {
    const fields: Omit<Field, 'id' | 'dockiteField' | 'schema' | 'schemaId'>[] =
      this.schemaField.settings.children ?? [];

    const fieldPromises = fields.map(
      async (f): Promise<null | FieldConfig<Source, GlobalContext>> => {
        const FieldClass = Object.values(dockiteFields).find(df => df.type === f.type);

        if (!FieldClass) {
          return null;
        }

        const dockiteField = new FieldClass(f as Field, this.orm);

        const [outputType, outputArgs] = await Promise.all([
          dockiteField.outputType({ dockiteSchemas, graphqlTypes, dockiteFields }),
          dockiteField.outputArgs(),
        ]);

        return {
          name: String(f.name),
          config: {
            type: outputType,
            resolve: async (data: any, args): Promise<any> => {
              const fieldData = data[f.name];
              const field = { ...f, id: 'child', schemaId: this.schemaField.id };

              return dockiteField.processOutputGraphQL<typeof outputType>({
                field,
                fieldData,
                data,
                args,
              });
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

    const fieldsToObjects = cleanedFields.map(field => {
      const { name: schemaName } = dockiteSchemas.find(
        schema => schema.id === this.schemaField.schemaId,
      ) ?? { name: 'Unknown' };

      return new GraphQLObjectType({
        name: graphqlCase(`${schemaName}_${this.schemaField.name}_Variant_${field.name}`),
        fields: { [field.name]: field.config },
        isTypeOf(value: any) {
          const [name] = Object.keys(value);

          return name === field.name;
        },
      });
    });

    return new GraphQLUnionType({
      name: String(this.schemaField.name),
      types: fieldsToObjects,
    });
  }
}
