import { watch, WatchCallback, WatchOptions, WatchSource, WatchStopHandle } from 'vue';

// type MapSources<T, Immediate> = {
//   [K in keyof T]: T[K] extends WatchSource<infer V>
//     ? Immediate extends true
//       ? V | undefined
//       : V
//     : T[K] extends object
//     ? Immediate extends true
//       ? T[K] | undefined
//       : T[K]
//     : never;
// };

// type MultiWatchSources = (WatchSource<unknown> | object)[];

// // overload: array of multiple sources + cb
// export function watchImmediate<
//   T extends MultiWatchSources,
//   Immediate extends Readonly<boolean> = true
// >(
//   sources: [...T],
//   cb: WatchCallback<MapSources<T, true>, MapSources<T, Immediate>>,
//   options?: WatchOptions<Immediate>,
// ): WatchStopHandle;

// // overload: multiple sources w/ `as const`
// // watch([foo, bar] as const, () => {})
// // somehow [...T] breaks when the type is readonly
// export function watchImmediate<
//   T extends Readonly<MultiWatchSources>,
//   Immediate extends Readonly<boolean> = true
// >(
//   source: T,
//   cb: WatchCallback<MapSources<T, true>, MapSources<T, Immediate>>,
//   options?: WatchOptions<Immediate>,
// ): WatchStopHandle;

// // overload: single source + cb
// export function watchImmediate<T, Immediate extends Readonly<boolean> = true>(
//   source: WatchSource<T>,
//   cb: WatchCallback<T, Immediate extends true ? T | undefined : T>,
//   options?: WatchOptions<Immediate>,
// ): WatchStopHandle;

// // overload: watching reactive object w/ cb
// export function watchImmediate<T extends object, Immediate extends Readonly<boolean> = true>(
//   source: T,
//   cb: WatchCallback<T, Immediate extends true ? T | undefined : T>,
//   options?: WatchOptions<Immediate>,
// ): WatchStopHandle;

// export function watchImmediate<T = any>(source: T | WatchSource<T>, cb: any): WatchStopHandle {
//   return watch(source as any, cb, { immediate: true });
// }

export function watchImmediate(source, cb) {
  return watch(source, cb, { immediate: true });
}

export default watchImmediate;
