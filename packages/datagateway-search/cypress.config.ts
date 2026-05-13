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

      return fetch(config.baseUrl + '/datagateway-search-settings.json')
        .then((response) => response.json())
        .then((data) => {
          const doiHandleUrl = data.doiHandleUrl ?? 'https://doi.org';
          config.expose = { ...config.expose, doiHandleUrl };
          return config;
        });
    },
    baseUrl: 'http://127.0.0.1:3000',
  },
});
