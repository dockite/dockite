export class DockiteFieldValidationError extends Error {
  public code: string;

  public path: string;

  public children?: DockiteFieldValidationError[];

  constructor(
    code: string,
    message: string,
    path: string,
    children?: DockiteFieldValidationError[],
  ) {
    super(message);

    this.code = code;
    this.path = path;

    if (children) {
      this.children = children;
    }
  }
}
