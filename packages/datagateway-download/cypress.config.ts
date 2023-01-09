import { defineConfig } from 'cypress';
export default defineConfig({
  chromeWebSecurity: false,
  video: false,
  retries: {
    runMode: 3,
    openMode: 1,
  },
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        failed: require('cypress-failed-log/src/failed')(),
      });
    },
    baseUrl: 'http://127.0.0.1:3000',
  },
});
