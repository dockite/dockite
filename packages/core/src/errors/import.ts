import { ApolloError } from 'apollo-server-express';

export class ImportError {
  constructor(message: string) {
    return new ApolloError(message, 'IMPORT_ERROR');
  }
}
