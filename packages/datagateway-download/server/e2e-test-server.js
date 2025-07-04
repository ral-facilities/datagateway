import express from 'express';
import path from 'path';

const app = express();

app.get('/datagateway-download-settings.json', function (req, res) {
  // detect if the E2E test is running inside CI
  // If so, use the settings file specific to E2E
  // Otherwise, use the same settings file that is also for running the app normally (yarn start etc).
  const isCiEnv = process.env.CI;
  res.sendFile(
    path.resolve(
      isCiEnv
        ? './server/e2e-settings.json'
        : './public/datagateway-download-settings.json'
    )
  );
});

app.use(
  express.static(path.resolve('./dist'), {
    index: ['index.html', 'index.htm'],
  })
);

app.get('/*', function (req, res) {
  res.sendFile(path.resolve('./dist/index.html'));
});

app.listen(3000);
