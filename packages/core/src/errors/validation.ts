import { ApolloError } from 'apollo-server-express';

export class DocumentValidationError {
  constructor(errors: Record<string, string>) {
    return new ApolloError('A validation error occurred', 'VALIDATION_ERROR', { errors });
  }
}
