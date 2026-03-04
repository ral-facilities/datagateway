import express from 'express';
import path from 'path';
import axios from 'axios';
import fs from 'fs';

const app = express();

app.use(
  express.json(),
  express.static(path.resolve('./dist'), {
    index: ['index.html', 'index.htm'],
  })
);

app.get('/datagateway-search-settings.json', function (req, res) {
  // detect if the E2E test is runnFing inside CI
  // If so, use the settings file specific to E2E
  // Otherwise, use the same settings file that is also for running the app normally (yarn start etc).
  const isCiEnv = process.env.CI;
  res.sendFile(
    path.resolve(
      isCiEnv
        ? './server/e2e-settings.json'
        : './public/datagateway-search-settings.json'
    )
  );
});

app.get(/\/sessions|investigations|datasets|datafiles/, function (req, res) {
  fs.readFile('server/e2e-settings.json').then((settings) => {
    axios
      .get(settings.apiUrl + req.url, {
        headers: req.headers,
      })
      .then((apiRes) => {
        res.json(apiRes.data);
      })
      .catch((error) => {
        res.status(error.response.status).end();
      });
  });
});

app.post(/\/sessions|investigations|datasets|datafiles/, function (req, res) {
  fs.readFile('server/e2e-settings.json').then((settings) => {
    axios
      .post(settings.apiUrl + req.url, req.body, {
        headers: req.headers,
      })
      .then((apiRes) => {
        res.json(apiRes.data);
      })
      .catch((error) => {
        res.status(error.response.status).end();
      });
  });
});

app.get('/*', function (req, res) {
  res.sendFile(path.resolve('./dist/index.html'));
});

app.listen(3000);
