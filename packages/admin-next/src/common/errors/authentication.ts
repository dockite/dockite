export enum AuthenticationErrorCode {
  BAD_CREDENTIALS = 'BAD_CREDENTIALS',
  UKNOWN_ERROR = 'UKNOWN_ERROR',
  NO_FIRST_USER = 'NO_FIRST_USER',
}

export class AuthenticationError extends Error {
  public code: AuthenticationErrorCode;

  constructor(message: string, code: AuthenticationErrorCode) {
    super(message);

    this.code = code;
  }

  public toString(): string {
    return `[${this.code}]: ${this.message}`;
  }
}
