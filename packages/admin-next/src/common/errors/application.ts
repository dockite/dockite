/* eslint-disable max-classes-per-file */
export enum ApplicationErrorCode {
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',

  NO_AUTH_PROVIDER = 'NO_AUTH_PROVIDER',
  NOT_AUTHORIZED = 'NOT_AUTHORIZED',

  NETWORK_ERROR = 'NETWORK_ERROR',

  INVALID_STATE = 'INVALID_STATE',

  FIELD_REGISTERED = 'FIELD_REGISTERED',
  NO_FIELD_HANDLER = 'NO_FIELD_HANDLER',

  SCHEMA_NOT_FOUND = 'SCHEMA_NOT_FOUND',
  CANT_CREATE_SCHEMA = 'CANT_CREATE_SCHEMA',
  CANT_DELETE_SCHEMA = 'CANT_DELETE_SCHEMA',

  SINGLETON_NOT_FOUND = 'SINGLETON_NOT_FOUND',
  CANT_CREATE_SINGLETON = 'CANT_CREATE_SINGLETON',
  CANT_DELETE_SINGLETON = 'CANT_DELETE_SINGLETON',
}

export class ApplicationError extends Error {
  public code: ApplicationErrorCode;

  constructor(message: string, code: ApplicationErrorCode) {
    super(message);

    this.code = code;
  }

  public toString(): string {
    return `[${this.code}]: ${this.message}`;
  }
}

export class ApplicationErrorGroup extends Error {
  public errors: ApplicationError[];

  constructor(message: string, errors: ApplicationError[]) {
    super(message);

    this.errors = errors;
  }

  public toString(): string {
    return this.errors.map(err => err.toString()).join('\n');
  }
}
