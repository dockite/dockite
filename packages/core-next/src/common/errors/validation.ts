import { ApolloError } from 'apollo-server-express';

export const DOCUMENT_VALIDATION_ERROR_CODE = 'VALIDATION_ERROR';

export const DOCUMENT_VALIDATION_ERROR_MESSAGE = 'A validation error has occurred.';

/**
 *
 */
export class DocumentValidationError extends ApolloError {
  constructor(errors: Record<string, string>) {
    super(DOCUMENT_VALIDATION_ERROR_MESSAGE, DOCUMENT_VALIDATION_ERROR_CODE, { errors });
  }
}

export default DocumentValidationError;
