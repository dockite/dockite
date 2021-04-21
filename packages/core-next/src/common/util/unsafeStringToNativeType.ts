/**
 *
 */
export function unsafeStringToNativeType<T = any>(input: string): T {
  try {
    return JSON.parse(String(input));
  } catch {
    return input as any;
  }
}

export default unsafeStringToNativeType;
