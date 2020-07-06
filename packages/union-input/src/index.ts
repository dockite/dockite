/**
 * This library is based on: https://github.com/Cardinal90/graphql-union-input-type
 *
 * The works here are not that of Dockite and are simply a patch in order to get the library working
 * with GraphQL > 15.0.0
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  GraphQLScalarType,
  GraphQLInputObjectType,
  GraphQLString,
  coerceInputValue,
  valueFromAST,
  GraphQLError,
  GraphQLInputType,
  StringValueNode,
} from 'graphql';
import { omit } from 'lodash';

const helper = (name: string, type: GraphQLInputType): GraphQLInputObjectType => {
  return new GraphQLInputObjectType({
    name,
    fields: {
      _type_: {
        type: GraphQLString,
      },
      _value_: {
        type,
      },
    },
  });
};

export type ValidUnionInputTypes = GraphQLInputObjectType | GraphQLScalarType;

export interface UnionInputTypeOptions {
  name: string;
  inputTypes: ValidUnionInputTypes[];
  typeKey: string;
  resolveType: (name: string) => ValidUnionInputTypes;
}

export default function UnionInputType(options: UnionInputTypeOptions): GraphQLScalarType {
  const { name, typeKey, resolveType } = options;

  const union = new GraphQLScalarType({
    name,

    serialize(value: any): any {
      return value;
    },

    parseValue(value: Record<string, any>): any {
      let type;
      let inputType;

      if (typeKey) {
        if (value[typeKey]) {
          type = value[typeKey];
        } else {
          throw new GraphQLError(
            `${name}(UnionInputType): Expected an object with "${typeKey}" property`,
          );
        }
      }

      if (typeof resolveType === 'function') {
        inputType = resolveType(type);

        if (!typeKey) {
          inputType = helper(type, inputType);
        }
      }

      if (!inputType) {
        throw new Error('Unable to determine inputType during execution');
      }

      const newValue = omit(value, typeKey);

      coerceInputValue(newValue, inputType);

      return newValue;
    },

    parseLiteral(ast): Record<string, any> {
      let type;
      let inputType;

      if (typeKey && ast.kind === 'ObjectValue') {
        try {
          for (let i = 0; i < ast.fields.length; i += 1) {
            if (ast.fields[i].name.value === typeKey) {
              type = (ast.fields[i].value as StringValueNode).value;
              break;
            }
          }
          if (!type) {
            throw new Error();
          }
        } catch (err) {
          throw new GraphQLError(
            `${name}(UnionInputType): Expected an object with "${typeKey}" property`,
          );
        }
      } else {
        try {
          if (
            ast.kind === 'ObjectValue' &&
            ast.fields[0].name.value === '_type_' &&
            ast.fields[1].name.value === '_value_'
          ) {
            type = (ast.fields[0].value as StringValueNode).value;
          } else {
            throw new Error();
          }
        } catch (err) {
          throw new GraphQLError(
            `${name}(UnionInputType): Expected an object with _type_ and _value_ properties in this order`,
          );
        }
      }

      if (typeof resolveType === 'function') {
        inputType = resolveType(type);

        if (!typeKey) {
          inputType = helper(type, inputType);
        }
      }

      if (!inputType) {
        throw new Error('Unable to determine inputType during execution');
      }

      return omit(valueFromAST(ast, inputType), typeKey);
    },
  });

  return union;
}
