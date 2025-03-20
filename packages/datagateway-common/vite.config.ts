import react from '@vitejs/plugin-react';
// import browserslistToEsbuild from 'browserslist-to-esbuild';
import fs from 'node:fs';
import path from 'path';
import url from 'url';
import { PluginOption, UserConfig, defineConfig, loadEnv } from 'vite';
import browserslistToEsbuild from 'browserslist-to-esbuild';

// see https://github.com/bvaughn/react-virtualized/issues/1722#issuecomment-1893242667
function reactVirtualized(): PluginOption {
  const WRONG_CODE = `import { bpfrpt_proptype_WindowScroller } from "../WindowScroller.js";`;

  return {
    name: 'my:react-virtualized',
    async configResolved() {
      const reactVirtualizedPath = path.dirname(
        url.fileURLToPath(import.meta.resolve('react-virtualized'))
      );

      const brokenFilePath = path.join(
        reactVirtualizedPath,
        '..', // back to dist
        'es',
        'WindowScroller',
        'utils',
        'onScroll.js'
      );
      const brokenCode = await fs.promises.readFile(brokenFilePath, 'utf-8');

      const fixedCode = brokenCode.replace(WRONG_CODE, '');
      await fs.promises.writeFile(brokenFilePath, fixedCode);
    },
  };
}

// Obtain default coverage config from vitest when not building for production
// (to avoid importing vitest during build as its a dev dependency)
let vitestDefaultExclude: string[] = [];
let vitestCoverageConfigDefaultsExclude: string[] = [];
if (process.env.NODE_ENV !== 'production') {
  await import('vitest/config').then((vitestConfig) => {
    vitestDefaultExclude = vitestConfig.defaultExclude;
    vitestCoverageConfigDefaultsExclude =
      vitestConfig.coverageConfigDefaults.exclude;
  });
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const plugins: PluginOption[] = [react(), reactVirtualized()];

  const config: UserConfig = {
    plugins: plugins,
    server: {
      port: 3000,
    },
    preview: {
      port: 5001,
    },
    define: {
      // See https://vitejs.dev/guide/build.html#library-mode
      // we need to replace here as the build in library mode won't
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV),
    },
  };

  config.build = {
    lib: {
      entry: 'src/main.tsx',
      name: 'datagateway-common',
    },
  };

  config.build.target = browserslistToEsbuild();

  return {
    ...config,
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['src/setupTests.tsx'],
      exclude: [...vitestDefaultExclude, 'e2e/**'],
      coverage: {
        reporter: [
          // Default
          'text',
          'html',
          'clover',
          'json',
          // Extra for VSCode extension
          ['lcov', { outputFile: 'lcov.info', silent: true }],
        ],
        exclude: [
          ...vitestCoverageConfigDefaultsExclude,
          'public/*',
          'src/vite-env.d.ts',
          'src/main.tsx',
        ],
      },
    },
  };
});
