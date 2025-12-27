declare module 'unplugin-swc' {
  import type { Plugin } from 'vite';

  interface SwcOptions {
    module?: { type: string };
  }

  const swc: {
    vite: (options?: SwcOptions) => Plugin;
  };

  export default swc;
}
