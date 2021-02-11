declare module '@rollup/plugin-dynamic-import-vars';
declare module '@rollup/plugin-strip';
declare module '@rollup/plugin-url';
declare module 'rollup-plugin-dev';
declare module 'rollup-plugin-progress';
declare module 'rollup-plugin-sizes';
declare module 'rollup-plugin-typescript2';
declare module 'rollup-plugin-visualizer';
declare module 'koa-compress';

declare module '@rollup/plugin-html' {
  import { Plugin, OutputChunk, OutputAsset, OutputBundle } from 'rollup';

  export interface RollupHtmlOptions {
    title?: string;
    attributes?: Record<string, any>;
    fileName?: string;
    meta?: Record<string, any>[];
    publicPath?: string;
    template?: (templateOptions: RollupHtmlTemplateOptions) => string;
  }

  export interface RollupHtmlTemplateOptions {
    title: string;
    attributes: Record<string, any>;
    publicPath: string;
    meta: Record<string, any>[];
    bundle: OutputBundle;
    files: Record<string, (OutputChunk | OutputAsset)[]>;
  }

  export function makeHtmlAttributes(attributes: Record<string, string>): string;

  /**
   * A Rollup plugin which creates HTML files to serve Rollup bundles.
   * @param options - Plugin options.
   * @returns Plugin instance.
   */
  export default function html(options: RollupHtmlOptions): Plugin;
}
