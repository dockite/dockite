import { Document } from '@dockite/database';

export const getDocumentIdentifier = (
  formData: Record<string, any>,
  document: Document | null,
): string => {
  if (formData.name) {
    return formData.name;
  }

  if (formData.title) {
    return formData.title;
  }

  if (formData.identifier) {
    return formData.identifier;
  }

  if (formData.id) {
    return formData.id;
  }

  if (!document) {
    return 'N/A';
  }

  return document.id;
};

export default getDocumentIdentifier;
