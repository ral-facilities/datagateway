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
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'chromium' && browser.name !== 'electron') {
          // Set pointer type to fine so that date inputs work properly
          launchOptions.args.push('--blink-settings=primaryPointerType=4');
        }

        if (browser.family === 'firefox') {
          // Set pointer type to fine so that date inputs work properly
          launchOptions.preferences['ui.primaryPointerCapabilities'] = 4;
        }

        // whatever you return here becomes the launchOptions
        return launchOptions;
      });
    },
    baseUrl: 'http://127.0.0.1:3000',
  },
});
