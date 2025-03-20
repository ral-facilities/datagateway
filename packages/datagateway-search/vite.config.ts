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

/* See https://stackoverflow.com/questions/69626090/how-to-watch-public-directory-in-vite-project-for-hot-reload allows
   hot reloading when json files are modified in the public folder*/
function jsonHMR(): PluginOption {
  return {
    name: 'json-hmr',
    enforce: 'post',
    handleHotUpdate({ file, server }) {
      if (file.endsWith('.json')) {
        console.log('reloading json file...');

        server.hot.send({
          type: 'full-reload',
          path: '*',
        });
      }
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

  // Whether to output build files in a way SciGateway can load (the default for production unless e2e testing)
  const buildLibrary =
    env.NODE_ENV === 'production' && env.VITE_APP_BUILD_STANDALONE !== 'true';

  const plugins: PluginOption[] = [react(), reactVirtualized()];

  if (env.NODE_ENV === 'development') plugins.push(jsonHMR());

  const config: UserConfig = {
    plugins: plugins,
    server: {
      port: 3000,
    },
    preview: {
      port: 5003,
    },
    define: {
      // See https://vitejs.dev/guide/build.html#library-mode
      // we need to replace here as the build in library mode won't
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV),
    },
  };

  const rollupExternals: string[] = [];

  if (buildLibrary) {
    // Config for deployment in SciGateway
    config.build = {
      lib: {
        entry: 'src/main.tsx',
        name: 'datagateway-search',
      },
      rollupOptions: {
        external: ['react', 'react-dom'].concat(rollupExternals),
        input: 'src/main.tsx',
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: '[name].chunk.js',
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
          },
        },
        preserveEntrySignatures: 'strict',
      },
    };
  } else {
    // Config for stand alone deployment e.g. for cypress
    config.build = {
      rollupOptions: {
        input: ['src/main.tsx', './index.html'],
        // Don't make react/react-dom external as not a library here, so have to bundle
        external: rollupExternals,
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
          },
        },
        preserveEntrySignatures: 'strict',
      },
    };
  }

  // Use browserslist config
  config.build.target = browserslistToEsbuild();

  return {
    ...config,
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['src/setupTests.ts'],
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
          'server/*',
          'cypress/*',
          'src/vite-env.d.ts',
          'src/main.tsx',
        ],
      },
    },
  };
});
