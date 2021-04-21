/* eslint-disable max-classes-per-file */
export enum ApplicationErrorCode {
  /**
   * General
   */
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_STATE = 'INVALID_STATE',

  /**
   * Authentication
   */
  NO_AUTH_PROVIDER = 'NO_AUTH_PROVIDER',
  NOT_AUTHORIZED = 'NOT_AUTHORIZED',

  /**
   * Fields
   */
  FIELD_REGISTERED = 'FIELD_REGISTERED',
  NO_FIELD_HANDLER = 'NO_FIELD_HANDLER',

  /**
   * Schemas
   */
  SCHEMA_NOT_FOUND = 'SCHEMA_NOT_FOUND',
  CANT_CREATE_SCHEMA = 'CANT_CREATE_SCHEMA',
  CANT_DELETE_SCHEMA = 'CANT_DELETE_SCHEMA',
  CANT_PERMANENT_DELETE_SCHEMA = 'CANT_PERMANENT_DELETE_SCHEMA',
  CANT_RESTORE_SCHEMA = 'CANT_RESTORE_SCHEMA',

  /**
   * Singletons
   */
  SINGLETON_NOT_FOUND = 'SINGLETON_NOT_FOUND',
  CANT_CREATE_SINGLETON = 'CANT_CREATE_SINGLETON',
  CANT_DELETE_SINGLETON = 'CANT_DELETE_SINGLETON',
  CANT_PERMANENT_DELETE_SINGLETON = 'CANT_PERMANENT_DELETE_SINGLETON',
  CANT_RESTORE_SINGLETON = 'CANT_RESTORE_SINGLETON',

  /**
   * Webhooks
   */
  WEBHOOK_NOT_FOUND = 'WEBHOOK_NOT_FOUND',
  CANT_CREATE_WEBHOOK = 'CANT_CREATE_WEBHOOK',
  CANT_UPDATE_WEBHOOK = 'CANT_UPDATE_WEBHOOK',
  CANT_DELETE_WEBHOOK = 'CANT_DELETE_WEBHOOK',

  /**
   * API Keys
   */
  CANT_CREATE_API_KEY = 'CANT_CREATE_API_KEY',
  CANT_DELETE_API_KEY = 'CANT_DELETE_API_KEY',
}

/**
 *
 */
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

/**
 *
 */
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
