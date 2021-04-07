declare module '@rollup/plugin-dynamic-import-vars';
declare module '@rollup/plugin-strip';
declare module '@rollup/plugin-url';
declare module 'rollup-plugin-serve';
declare module 'rollup-plugin-progress';
declare module 'rollup-plugin-sizes';
// declare module 'rollup-plugin-typescript2';
declare module 'rollup-plugin-visualizer';
declare module 'rollup-plugin-peer-deps-external';
declare module 'koa-compress';

declare module '@rollup/plugin-html' {
  import { Plugin, OutputChunk, OutputAsset, OutputBundle } from 'rollup';

  export interface RollupHtmlTemplateOptions {
    title: string;
    attributes: Record<string, any>;
    publicPath: string;
    meta: Record<string, any>[];
    bundle: OutputBundle;
    files: Record<string, (OutputChunk | OutputAsset)[]>;
  }

  export interface RollupHtmlOptions {
    title?: string;
    attributes?: Record<string, any>;
    fileName?: string;
    meta?: Record<string, any>[];
    publicPath?: string;
    template?: (_templateOptions: RollupHtmlTemplateOptions) => string;
  }

  export function makeHtmlAttributes(_attributes: Record<string, string>): string;

  /**
   * A Rollup plugin which creates HTML files to serve Rollup bundles.
   * @param options - Plugin options.
   * @returns Plugin instance.
   */
  export default function html(_options: RollupHtmlOptions): Plugin;
}
