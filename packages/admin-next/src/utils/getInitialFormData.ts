import { Document, Schema, Singleton } from '@dockite/database';

export const getInitialFormData = (
  document: Document | Singleton,
  schema: Schema | Singleton,
): Record<string, any> => {
  const data: Record<string, any> = {};

  schema.fields.forEach(field => {
    if (document.data[field.name] === undefined) {
      data[field.name] = null;
    } else {
      data[field.name] = document.data[field.name];
    }
  });

  return data;
};

export default getInitialFormData;
