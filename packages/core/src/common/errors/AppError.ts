import { AppErrorCode } from '../types/error';

export class AppError extends Error {
  name = 'AppError';

  code: AppErrorCode = AppErrorCode.UnknownError;

  constructor(message: string, code: AppErrorCode) {
    super(message);
    this.code = code;
  }

  toString(): string {
    return `${super.toString()} Code: ${this.code}`;
  }
}
