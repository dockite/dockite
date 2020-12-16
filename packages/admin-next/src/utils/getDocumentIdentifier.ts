import { Document } from '@dockite/database';

export const getDocumentIdentifier = (document: Document): string => {
  if (document.data.name) {
    return document.data.name;
  }

  if (document.data.title) {
    return document.data.title;
  }

  if (document.data.identifier) {
    return document.data.identifier;
  }

  if (document.data.id) {
    return document.data.id;
  }

  return document.id;
};

export default getDocumentIdentifier;
